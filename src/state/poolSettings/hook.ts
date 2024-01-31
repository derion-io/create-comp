import jsonERC20 from '@uniswap/v2-core/build/ERC20.json'
import jsonUniswapV2Pool from '@uniswap/v2-core/build/UniswapV2Pair.json'
import { ADDRESS_ZERO } from '@uniswap/v3-sdk'
import { rateToHL } from 'derivable-tools/dist/utils/helper'
import { ethers, utils } from 'ethers'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { messageAndViewOnBsc } from '../../Components/MessageAndViewOnBsc'
import { abi as helperAbi } from '../../utils/abi/Helper.json'
import { abi as poolBaseAbi } from '../../utils/abi/PoolBase.json'
import { abi as PoolDeployerAbi } from '../../utils/abi/PoolDeployer.json'
import jsonUniswapV3Pool from '../../utils/abi/UniswapV3Pool.json'
import { abi as univeralTokenRouterAbi } from '../../utils/abi/UniversalTokenRouter.json'
import { NATIVE_ADDRESS, Q128, Q256M } from '../../utils/constant'
import {
  calculateInitParamsFromPrice,
  feeToOpenRate,
  findFetcher,
  mulDivNum
} from '../../utils/deployHelper'
import { NUM, bn, numberToWei } from '../../utils/helpers'
import { State } from '../types'
import { setPoolSettings } from './reducer'
import { PoolSettingsType } from './type'
import { isAddress } from 'ethers/lib/utils'
import { useConfigs } from '../config/useConfigs'
import { useFeeData } from '../pools/hooks/useFeeData'
import { useWeb3React } from '../customWeb3React/hook'

export const usePoolSettings = () => {
  const { configs } = useConfigs()
  const { feeData } = useFeeData()
  const gasPrice = bn(feeData?.gasPrice ?? 1)
  const { provider, chainId } = useWeb3React()
  const signer = provider.getSigner()

  const { poolSettings } = useSelector((state: State) => {
    return {
      poolSettings: state.poolSettings as PoolSettingsType
    }
  })

  const dispatch = useDispatch()

  const updatePoolSettings = (newPoolSettings: Partial<PoolSettingsType>) => {
    for (const key in newPoolSettings) {
      if (newPoolSettings[key] !== poolSettings[key]) {
        if (
          Number.isNaN(Number(newPoolSettings[key]) || !newPoolSettings[key])
        ) {
          newPoolSettings[key] = ''
        }
        dispatch(setPoolSettings(newPoolSettings))
        break
      }
    }
  }

  const calculateParamsForPools = async () => {
    try {
      const settings = {
        ...poolSettings,
        closingFee: Number(poolSettings.closingFee) / 100,
        interestRate: Number(poolSettings.interestRate) / 100,
        premiumRate: Number(poolSettings.premiumRate) / 100
      }
      if (!isAddress(poolSettings.pairAddress)) {
        // throw new Error('Invalid Pool Address')
        updatePoolSettings({
          errorMessage: 'Invalid Pool Address'
        })
        return []
      }

      const TOKEN_R =
        settings.reserveToken === 'PLD'
          ? configs.derivable.playToken
          : settings.reserveToken === NATIVE_ADDRESS
          ? configs.wrappedTokenAddress
          : settings.reserveToken

      let uniswapPair = new ethers.Contract(
        settings.pairAddress,
        jsonUniswapV3Pool.abi,
        provider
      )

      // Note: some weird bug that "a ?? await b()" does not work
      const factory = settings.factory ? settings.factory : await uniswapPair.callStatic.factory()
      const [FETCHER, fetcherType] = findFetcher(configs, factory)
      const exp = fetcherType?.endsWith('3') ? 2 : 1
      if (exp === 1) {
        // Case this pair is UniswapV2
        uniswapPair = new ethers.Contract(
          settings.pairAddress,
          jsonUniswapV2Pool.abi,
          signer
        )
      }
      if (!settings.tokens) {
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
        if (!symbol0 && !symbol1 && !decimals0 && !decimals1) {
          // throw new Error('Invalid Pool Address')
          updatePoolSettings({
            errorMessage: 'Invalid Pool Address'
          })
          return []
        }
        settings.slot0 = slot0
        settings.tokens = [{
          address: token0,
          symbol: symbol0,
          decimals: decimals0,
        }, {
          address: token1,
          symbol: symbol1,
          decimals: decimals1,
        }]
      }
      // detect QTI (quote token index)
      let QTI = poolSettings.QTI
      if (QTI == null && settings.tokens[0].symbol.includes('USD')) {
        QTI = 0
      }
      if (QTI == null && settings.tokens[1].symbol.includes('USD')) {
        QTI = 1
      }
      if (QTI == null && configs.stablecoins.includes(settings.tokens[0].address)) {
        QTI = 0
      }
      if (QTI == null && configs.stablecoins.includes(settings.tokens[1].address)) {
        QTI = 1
      }
      if (QTI == null && configs.wrappedTokenAddress == settings.tokens[0].address) {
        QTI = 0
      }
      if (QTI == null && configs.wrappedTokenAddress == settings.tokens[1].address) {
        QTI = 1
      }
      if (QTI == null) {
        QTI = 0
        // throw new Error('unable to detect QTI')
      }

      const baseToken = settings.tokens[1-QTI]

      const K = Number(settings.power) * exp

      updatePoolSettings({
        QTI,
        x: String(K)
      })
      const SCAN_API_KEY = {
        42161: process.env.REACT_APP_ARBISCAN_API_KEY,
        56: process.env.REACT_APP_BSCSCAN_API_KEY
      }

      let logs
      const EPOCH = 500 * 60
      if ((settings.slot0 && !settings.window) || (!settings.slot0 && !settings?.windowBlocks)) {
        const now = Math.floor(new Date().getTime() / 1000)
        const anEpochAgo = now - EPOCH
        const blockEpochAgo = await fetch(
          `${configs.scanApi}?module=block&action=getblocknobytime&timestamp=${anEpochAgo}&closest=before&apikey=${SCAN_API_KEY[chainId]}`
        )
          .then((x) => x.json())
          .then((x) => Number(x?.result))

        const SWAP_TOPIC = {
          2: '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
          3: '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67'
        }

        logs = await fetch(
          `${configs.scanApi}?module=logs&action=getLogs&address=${settings.pairAddress}` +
            `&topic0=${SWAP_TOPIC[settings.slot0 ? 3 : 2]}` +
            `&fromBlock=${blockEpochAgo}&apikey=${SCAN_API_KEY[chainId]}`
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
      if (settings.slot0) {
        if (logs?.length > 0) {
          const txFreq = EPOCH / logs.length
          WINDOW = Math.ceil(Math.sqrt(txFreq / 60)) * 60
        } else {
          WINDOW = settings.window
        }
        if (WINDOW) console.log('WINDOW', NUM(WINDOW) / 60, 'min(s)')
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

      if (settings.slot0) {
        MARK = settings.slot0.sqrtPriceX96.shl(32)
        if (QTI === 0) {
          MARK = Q256M.div(MARK)
        }
        price = MARK.mul(MARK)
      } else {
        const [r0, r1] = await uniswapPair.getReserves()
        if (QTI === 0) {
          MARK = r0.mul(Q128).div(r1)
        } else {
          MARK = r1.mul(Q128).div(r0)
        }
        price = MARK
      }

      const decShift = settings.tokens[1-QTI].decimals - settings.tokens[QTI].decimals
      if (decShift > 0) {
        price = price.mul(numberToWei(1, decShift))
      } else if (decShift < 0) {
        price = price.div(numberToWei(1, -decShift))
      }

      updatePoolSettings({
        markPrice: mulDivNum(price, Q128.pow(exp))
      })
      if (settings.amountIn === '' || settings.amountIn === '0') {
        // throw new Error('Invalid Input Amount')
        updatePoolSettings({
          errorMessage: 'Invalid Input Amount'
        })
        return []
      }
      const INTEREST_HL = rateToHL(settings.interestRate, NUM(settings.power))
      const PREMIUM_HL = rateToHL(
        settings.premiumRate ? settings.premiumRate : 0,
        NUM(settings.power)
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
        MATURITY_VEST: Number(settings.vesting),
        MATURITY_RATE: feeToOpenRate(settings.closingFee ?? 0),
        OPEN_RATE: feeToOpenRate(settings.openingFee ?? 0)
      }
      console.log('#configs.derivable.poolDeployer', configs)
      const poolDeployer = new ethers.Contract(
        configs.derivable.poolDeployer!,
        PoolDeployerAbi,
        signer
      )
      const R = ethers.utils.parseEther(String(settings.amountIn || '0'))
      const initParams = calculateInitParamsFromPrice(config, MARK, R)
      console.log('#configs.helperContract.utr', configs.helperContract.utr)
      const utr = new ethers.Contract(
        configs.helperContract.utr,
        univeralTokenRouterAbi,
        signer
      )
      console.log(
        '#configs.derivable.helper',
        configs.derivable.stateCalHelper
      )
      const helper = new ethers.Contract(
        configs.derivable.stateCalHelper,
        helperAbi,
        signer
      )
      console.log('#pool-config', config)
      const poolAddress = await poolDeployer.callStatic.create(config)
      console.log('#poolAddress', poolAddress)
      const pool = new ethers.Contract(poolAddress, poolBaseAbi, signer)

      updatePoolSettings({
        newPoolAddress: poolAddress
      })

      if (R.eq(0)) {
        return []
      }
      // let params = []

      // if (TOKEN_R !== configs.wrappedTokenAddress) {
      //   const deployerAddress = await deployer.getAddress()
      //   if (
      //     (TOKEN_R as String).toLowerCase() !== NATIVE_ADDRESS.toLowerCase()
      //   ) {
      //     const rERC20 = new ethers.Contract(TOKEN_R, jsonERC20.abi, deployer)
      //     const rAllowance = await rERC20.allowance(
      //       deployerAddress,
      //       utr.address
      //     )
      //     if (rAllowance.lt(R)) {
      //       updatePoolSettings({
      //         errorMessage: 'Token reserve approval required'
      //       })
      //       // throw new Error('!!! Token reserve approval required !!!')
      //     }
      //   }
      //   const payment = {
      //     utr: utr.address,
      //     payer: deployerAddress,
      //     recipient: deployerAddress
      //   }
      //   const PAYMENT = 0

      //   params = [
      //     [],
      //     [
      //       {
      //         inputs: [],
      //         code: poolDeployer.address,
      //         data: (await poolDeployer.populateTransaction.create(config)).data
      //       },
      //       {
      //         inputs: [
      //           {
      //             mode: PAYMENT,
      //             eip: 20,
      //             token: TOKEN_R,
      //             id: 0,
      //             amountIn: R,
      //             recipient: pool.address
      //           }
      //         ],
      //         code: poolAddress,
      //         data: (await pool.populateTransaction.init(initParams, payment))
      //           .data
      //       }
      //     ],
      //     { gasPrice }
      //   ]
      // } else {
      //   params = [
      //     config,
      //     initParams,
      //     configs.derivable.poolDeployer,
      //     { value: R, gasPrice }
      //   ]
      // }

      let params = []
      const deployerAddress = await signer.getAddress()
      const topics = [
        baseToken.address,
        baseToken.symbol,
        poolSettings.searchBySymbols[0] ?? baseToken.symbol.slice(0, -1),
        poolSettings.searchBySymbols[1] ?? baseToken.symbol.slice(1),
      ].map((value, i) => {
        if (i > 0) {
          return utils.formatBytes32String(value.toUpperCase())
        }
        return value
      })
      if (TOKEN_R != configs.wrappedTokenAddress && deployerAddress) {
        console.log('#deployerAddress', deployerAddress, TOKEN_R)
        const rToken = new ethers.Contract(TOKEN_R, jsonERC20.abi, signer)
        const rBalance = await rToken.balanceOf(deployerAddress)
        if (rBalance.lt(R)) {
          throw new Error(`TOKEN_R balance insufficient: ${rBalance} < ${R}`)
        }
        const rAllowance = await rToken.allowance(deployerAddress, utr.address)
        if (rAllowance.lt(R)) {
          // await rERC20.approve(utr.address, ethers.constants.MaxUint256)
          throw new Error(`TOKEN_R approval required for UTR (${utr.address})`)
        }
        const payment = {
          utr: utr.address,
          payer: deployerAddress,
          recipient: deployerAddress
        }
        params = [
          [],
          [
            {
              inputs: [
                {
                  mode: 0,
                  eip: 20,
                  token: TOKEN_R,
                  id: 0,
                  amountIn: R,
                  recipient: pool.address
                }
              ],
              code: poolDeployer.address,
              data: (
                await poolDeployer.populateTransaction.deploy(
                  config,
                  initParams,
                  payment,
                  ...topics
                )
              ).data
            }
          ],
          { gasPrice }
        ]
      } else {
        const payment = {
          utr: ADDRESS_ZERO,
          payer: [],
          recipient: deployerAddress
        }
        params = [
          config,
          initParams,
          payment,
          ...topics,
          { value: R, gasPrice }
        ]
      }
      console.log('#gas.config', params)
      const gasUsed =
        TOKEN_R != configs.wrappedTokenAddress
          ? await utr.estimateGas.exec(...params)
          : await poolDeployer.estimateGas.deploy(...params)

      // const gasUsed =
      //   TOKEN_R != configs.wrappedTokenAddress
      //     ? await utr.estimateGas.exec(...params)
      //     : await helper.estimateGas.createPool(...params)
      updatePoolSettings({
        gasUsed: gasUsed.toString()
      })
      console.log('#gasUsed', gasPrice, gasUsed)

      updatePoolSettings({
        errorMessage: ''
      })
      return params
    } catch (err) {
      console.log('####', err)
      updatePoolSettings({
        errorMessage:
          err?.reason ?? err?.error ?? err?.data?.message ?? 'unknown'
      })
      return []
    }
  }
  const deployPool = async () => {
    if (provider && signer) {
      const params = await calculateParamsForPools()
      if (params && params?.length === 0) {
        return
      }
      const settings = poolSettings
      const TOKEN_R =
        settings.reserveToken === 'PLD'
          ? configs.derivable.playToken
          : settings.reserveToken === NATIVE_ADDRESS
            ? configs.wrappedTokenAddress
            : settings.reserveToken

      const utr = new ethers.Contract(
        configs.helperContract.utr,
        univeralTokenRouterAbi,
        signer
      )

      // const helper = new ethers.Contract(
      //   configs.derivable.helper ?? configs.derivable.stateCalHelper,
      //   helperAbi,
      //   deployer
      // )
      try {
        const poolDeployer = new ethers.Contract(
          configs.derivable.poolDeployer!,
          PoolDeployerAbi,
          signer
        )
        console.log('#param', params, TOKEN_R != configs.wrappedTokenAddress)
        const tx =
          TOKEN_R != configs.wrappedTokenAddress
            ? await utr.exec(...(params || []))
            : await poolDeployer.deploy(...(params || []))

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
      } catch (e) {
        toast.error(e?.reason ?? e?.message ?? 'Transaction Failed')
        // console.error(parseCallStaticError(err), err.reason ?? err.error ?? err)
        // toast.error(parseCallStaticError(err))
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
