import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { setPoolSettings } from './reducer'
import { PoolSettingsType } from './type'
import { ethers } from 'ethers'
import { NATIVE_ADDRESS, Q128, Q256M, ZERO_ADDRESS } from '../../utils/constant'
import jsonUniswapV3Pool from '../../utils/abi/UniswapV3Pool.json'
import jsonUniswapV2Pool from '@uniswap/v2-core/build/UniswapV2Pair.json'
import jsonERC20 from '@uniswap/v2-core/build/ERC20.json'
import { abi as poolFactoryAbi } from '../../utils/abi/PoolFactory.json'
import { abi as poolBaseAbi } from '../../utils/abi/PoolBase.json'
import { abi as univeralTokenRouterAbi } from '../../utils/abi/UniversalTokenRouter.json'
import { abi as helperAbi } from '../../utils/abi/Helper.json'
import {
  calculateInitParamsFromPrice,
  feeToOpenRate,
  findFetcher,
  mulDivNum
} from '../../utils/deployHelper'
import { bn, numberToWei, parseCallStaticError } from '../../utils/helpers'
import { rateToHL } from 'derivable-tools/dist/utils/helper'
import { State } from '../types'
import { toast } from 'react-toastify'
import { messageAndViewOnBsc } from '../../Components/MessageAndViewOnBsc'

export const usePoolSettings = () => {
  const { poolSettings } = useSelector((state: State) => {
    return {
      poolSettings: state.poolSettings as PoolSettingsType
    }
  })

  const dispatch = useDispatch()

  const updatePoolSettings = (newPoolSettings: Partial<PoolSettingsType>) => {
    for (const key in newPoolSettings) {
      if (newPoolSettings[key] !== poolSettings[key]) {
        dispatch(setPoolSettings(newPoolSettings))
        break
      }
    }
  }

  const calculateParamsForPools = async (
    chainID: string,
    provider: ethers.providers.JsonRpcProvider,
    deployer: ethers.Signer
  ) => {
    try {
      const settings = {
        ...poolSettings,
        closingFee: poolSettings.closingFee / 100,
        interestRate: poolSettings.interestRate / 100,
        premiumRate: poolSettings.premiumRate / 100
      }
      const gasPrice = await provider.getGasPrice()
      updatePoolSettings({
        gasPrice: gasPrice
      })

      const configs = await fetch(
        `https://raw.githubusercontent.com/derivable-labs/configs/dev/${chainID}/network.json`
      ).then((res) => res.json())

      const TOKEN_R = settings.reserveToken

      let uniswapPair = new ethers.Contract(
        settings.pairAddress,
        jsonUniswapV3Pool.abi,
        provider
      )

      const factory = await uniswapPair.callStatic.factory()
      const [FETCHER, fetcherType] = findFetcher(configs.fetchers, factory)
      const exp = fetcherType?.endsWith('3') ? 2 : 1
      if (exp === 1) {
        // Case this pair is UniswapV2
        uniswapPair = new ethers.Contract(
          settings.pairAddress,
          jsonUniswapV2Pool.abi,
          deployer
        )
      }
      const [slot0, token0, token1] = await Promise.all([
        exp === 2 ? uniswapPair.callStatic.slot0() : undefined,
        uniswapPair.callStatic.token0(),
        uniswapPair.callStatic.token1()
      ])
      const ct0 = new ethers.Contract(token0, jsonERC20.abi, provider)
      const ct1 = new ethers.Contract(token1, jsonERC20.abi, provider)
      const [decimals0, decimals1, symbol0, symbol1] = await Promise.all([
        ct0.callStatic.decimals(),
        ct1.callStatic.decimals(),
        ct0.callStatic.symbol(),
        ct1.callStatic.symbol()
      ])

      // detect QTI (quote token index)
      let QTI
      if (QTI == null && symbol0.includes('USD')) {
        QTI = 0
      }
      if (QTI == null && symbol1.includes('USD')) {
        QTI = 1
      }
      if (QTI == null && configs.stablecoins.includes(token0)) {
        QTI = 0
      }
      if (QTI == null && configs.stablecoins.includes(token1)) {
        QTI = 1
      }
      if (QTI == null && configs.wrappedTokenAddress == token0) {
        QTI = 0
      }
      if (QTI == null && configs.wrappedTokenAddress == token1) {
        QTI = 1
      }
      if (QTI == null) {
        QTI = 0
        // throw new Error('unable to detect QTI')
      }

      const K = settings.power * exp
      const prefix = exp == 2 ? '√' : ''

      updatePoolSettings({
        x: K
      })
      const SCAN_API_KEY = {
        42161: process.env.REACT_APP_ARBISCAN_API_KEY,
        56: process.env.REACT_APP_BSCSCAN_API_KEY
      }

      let logs
      const EPOCH = 500 * 60
      if ((slot0 && !settings.window) || (!slot0 && !settings?.windowBlocks)) {
        const now = Math.floor(new Date().getTime() / 1000)
        const anEpochAgo = now - EPOCH
        const blockEpochAgo = await fetch(
          `${configs.scanApi}?module=block&action=getblocknobytime&timestamp=${anEpochAgo}&closest=before&apikey=${SCAN_API_KEY[chainID]}`
        )
          .then((x) => x.json())
          .then((x) => Number(x?.result))

        const SWAP_TOPIC = {
          2: '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
          3: '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67'
        }

        logs = await fetch(
          `${configs.scanApi}?module=logs&action=getLogs&address=${settings.pairAddress}` +
            `&topic0=${SWAP_TOPIC[slot0 ? 3 : 2]}` +
            `&fromBlock=${blockEpochAgo}&apikey=${SCAN_API_KEY[chainID]}`
        )
          .then((x) => x.json())
          .then((x) => x?.result)

        if (!logs?.length) {
          updatePoolSettings({
            errorMessage: 'No transaction for a whole day'
          })
          // throw new Error('no transaction for a whole day')
        }
      }
      let WINDOW
      if (slot0) {
        if (logs?.length > 0) {
          const txFreq = EPOCH / logs.length
          WINDOW = Math.ceil(Math.sqrt(txFreq / 60)) * 60
        } else {
          WINDOW = settings.window
        }
        if (WINDOW) console.log('WINDOW', WINDOW / 60, 'min(s)')
        try {
          await uniswapPair.callStatic.observe([0, WINDOW])
        } catch (err) {
          if (err.reason == 'OLD') {
            updatePoolSettings({
              errorMessage: 'WINDOW too long'
            })
            // throw new Error('WINDOW too long')
          }
          // throw err
          updatePoolSettings({
            errorMessage: err.reason ?? err.error ?? err
          })
        }
      } else {
        if (logs?.length > 0) {
          const range =
            logs[logs.length - 1].blockNumber - logs[0].blockNumber + 1
          const txFreq = range / logs.length
          WINDOW = Math.floor(txFreq / 10) * 10
          WINDOW = Math.max(WINDOW, 20)
          WINDOW = Math.min(WINDOW, 256)
        } else {
          WINDOW = settings.windowBlocks
        }
        console.log('WINDOW', WINDOW, 'block(s)')
      }

      const ORACLE = ethers.utils.hexZeroPad(
        bn(QTI)
          .shl(255)
          .add(bn(WINDOW).shl(256 - 64))
          .add(settings.pairAddress)
          .toHexString(),
        32
      )
      let MARK, price

      if (slot0) {
        MARK = slot0.sqrtPriceX96.shl(32)
        if (QTI == 0) {
          MARK = Q256M.div(MARK)
        }
        price = MARK.mul(MARK)
      } else {
        const [r0, r1] = await uniswapPair.getReserves()
        if (QTI == 0) {
          MARK = r0.mul(Q128).div(r1)
        } else {
          MARK = r1.mul(Q128).div(r0)
        }
        price = MARK
      }

      const decShift = QTI == 0 ? decimals1 - decimals0 : decimals0 - decimals1
      if (decShift > 0) {
        price = price.mul(numberToWei(1, decShift))
      } else if (decShift < 0) {
        price = price.div(numberToWei(1, -decShift))
      }

      updatePoolSettings({
        markPrice: mulDivNum(price, Q128.pow(exp))
      })

      const INTEREST_HL = rateToHL(settings.interestRate, settings.power)
      const PREMIUM_HL = rateToHL(
        settings.premiumRate ? settings.premiumRate : 0,
        settings.power
      )

      const config = {
        FETCHER,
        ORACLE,
        TOKEN_R,
        MARK,
        K: bn(K),
        INTEREST_HL,
        PREMIUM_HL,
        MATURITY: settings.closingFeeDuration,
        MATURITY_VEST: settings.vesting,
        MATURITY_RATE: feeToOpenRate(settings.closingFee ?? 0),
        OPEN_RATE: feeToOpenRate(settings.openingFee ?? 0)
      }

      const poolFactory = new ethers.Contract(
        configs.derivable.poolFactory,
        poolFactoryAbi,
        deployer
      )
      const R = ethers.utils.parseEther(String(settings.amountIn))
      const initParams = calculateInitParamsFromPrice(config, MARK, R)

      const utr = new ethers.Contract(
        configs.helperContract.utr,
        univeralTokenRouterAbi,
        deployer
      )

      const helper = new ethers.Contract(
        configs.derivable.helper ?? configs.derivable.stateCalHelper,
        helperAbi,
        deployer
      )

      const poolAddress = await poolFactory.callStatic.createPool(config)
      const pool = new ethers.Contract(poolAddress, poolBaseAbi, deployer)

      updatePoolSettings({
        newPoolAddress: poolAddress
      })
      if (R.eq(0)) {
        return []
      }
      let params = []

      if (TOKEN_R !== configs.wrappedTokenAddress) {
        const deployerAddress = await deployer.getAddress()
        if (
          (TOKEN_R as String).toLowerCase() !== NATIVE_ADDRESS.toLowerCase()
        ) {
          const rERC20 = new ethers.Contract(TOKEN_R, jsonERC20.abi, deployer)
          const rAllowance = await rERC20.allowance(
            deployerAddress,
            utr.address
          )
          if (rAllowance.lt(R)) {
            updatePoolSettings({
              errorMessage: 'Token reserve approval required'
            })
            // throw new Error('!!! Token reserve approval required !!!')
          }
        }
        const payment = {
          utr: utr.address,
          payer: deployerAddress,
          recipient: deployerAddress
        }
        const PAYMENT = 0

        params = [
          [],
          [
            {
              inputs: [],
              code: poolFactory.address,
              data: (await poolFactory.populateTransaction.createPool(config))
                .data
            },
            {
              inputs: [
                {
                  mode: PAYMENT,
                  eip: 20,
                  token: TOKEN_R,
                  id: 0,
                  amountIn: R,
                  recipient: pool.address
                }
              ],
              code: poolAddress,
              data: (await pool.populateTransaction.init(initParams, payment))
                .data
            }
          ],
          { gasPrice }
        ]
      } else {
        params = [
          config,
          initParams,
          configs.derivable.poolFactory,
          { value: R, gasPrice }
        ]
      }

      const gasUsed =
        TOKEN_R != configs.wrappedTokenAddress
          ? await utr.estimateGas.exec(...params)
          : await helper.estimateGas.createPool(...params)
      updatePoolSettings({
        gasUsed: gasUsed.toNumber()
      })

      return params
    } catch (err) {
      console.log(err)
      updatePoolSettings({
        errorMessage: err.reason ?? err.error ?? err
      })
      return []
    }
  }

  const deployPool = async (
    chainID: string,
    provider: ethers.providers.JsonRpcProvider,
    deployer: ethers.Signer
  ) => {
    if (provider && deployer) {
      const params = await calculateParamsForPools(chainID, provider, deployer)
      if (params.length == 0) {
        return
      }
      const settings = poolSettings
      const configs = await fetch(
        `https://raw.githubusercontent.com/derivable-labs/configs/dev/${chainID}/network.json`
      ).then((res) => res.json())
      const TOKEN_R = settings.reserveToken

      const utr = new ethers.Contract(
        configs.helperContract.utr,
        univeralTokenRouterAbi,
        deployer
      )

      const helper = new ethers.Contract(
        configs.derivable.helper ?? configs.derivable.stateCalHelper,
        helperAbi,
        deployer
      )
      try {
        const tx =
          TOKEN_R != configs.wrappedTokenAddress
            ? await utr.exec(...params)
            : await helper.createPool(...params)

        console.log('Waiting for tx receipt...', tx.hash)

        const rec = await tx.wait()
        const hash = rec.transactionHash
        toast.success(
          messageAndViewOnBsc({
            title: 'Approve success',
            hash
          })
        )
        console.log('Gas Used:', rec.gasUsed.toNumber())
        console.log('Logs:', rec.logs)
      } catch (err) {
        console.error(err.reason ?? err.error ?? err)
        toast.error(parseCallStaticError(err))
      }
    } else {
      toast.error('Please connect the wallet')
    }
  }

  return {
    poolSettings,
    updatePoolSettings,
    calculateParamsForPools,
    deployPool
  }
}
