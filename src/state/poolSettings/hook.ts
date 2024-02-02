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
import { NUM, STR, bn, numberToWei, parseCallStaticError } from '../../utils/helpers'
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
      const settings = { ...poolSettings }

      if (!isAddress(settings.pairAddress)) {
        // throw new Error('Invalid Pool Address')
        updatePoolSettings({
          errorMessage: 'Invalid Pool Address'
        })
        return []
      }

      // Note: some weird bug that "a ?? await b()" does not work
      const factory = settings.factory
      if (!factory) {
        updatePoolSettings({
          errorMessage: 'Missing factory'
        })
        return []
      }
      const [FETCHER, fetcherType] = findFetcher(configs, factory)
      const exp = fetcherType?.endsWith('3') ? 2 : 1
      if (!settings.tokens) {
        updatePoolSettings({
          errorMessage: 'Missing pair tokens'
        })
        return []
      }
      const K = Number(settings.power) * exp
      updatePoolSettings({
        x: String(K),
      })

      const { QTI, baseToken } = settings

      if (QTI == null || baseToken == null) {
        updatePoolSettings({
          errorMessage: 'Missing token info'
        })
        return []
      }

      let WINDOW
      if (settings.slot0) {
        WINDOW = settings.window
        if (WINDOW) console.log('WINDOW', NUM(WINDOW) / 60, 'min(s)')
        const uniswapPair = new ethers.Contract(
          settings.pairAddress,
          jsonUniswapV3Pool.abi,
          provider
        )
        // no need to wait for this
        uniswapPair.callStatic.observe([0, WINDOW])
          .catch((err: any) => {
            if (err.reason == 'OLD') {
              updatePoolSettings({
                errorMessage: 'WINDOW too long'
              })
              // throw new Error('WINDOW too long')
            }
            // throw err
            updatePoolSettings({
              errorMessage: parseCallStaticError(err) ?? err.reason ?? err.error ?? err
            })
          })
      } else {
        WINDOW = settings.windowBlocks
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

      console.log('zerg', settings.slot0)

      if (settings.slot0) {
        MARK = settings.slot0.sqrtPriceX96.shl(32)
        if (QTI === 0) {
          MARK = Q256M.div(MARK)
        }
        price = MARK.mul(MARK)
      } else {
        const {r0, r1} = settings
        if (!r0 || !r1) {
          updatePoolSettings({
            errorMessage: 'Missing pair reserves'
          })
          return []
        }
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

      const TOKEN_R =
        settings.reserveToken === 'PLD'
          ? configs.derivable.playToken
          : settings.reserveToken === NATIVE_ADDRESS
          ? configs.wrappedTokenAddress
          : settings.reserveToken

      const config = {
        FETCHER,
        ORACLE,
        TOKEN_R,
        MARK,
        K: bn(K),
        INTEREST_HL: rateToHL(NUM(settings.interestRate ?? 0) / 100, NUM(settings.power)),
        PREMIUM_HL: rateToHL(NUM(settings.premiumRate ?? 0) / 100, NUM(settings.power)),
        MATURITY: settings.closingFeeDuration,
        MATURITY_VEST: Number(settings.vesting),
        MATURITY_RATE: feeToOpenRate(NUM(settings.closingFee ?? 0) / 100),
        OPEN_RATE: feeToOpenRate(NUM(settings.openingFee ?? 0) / 100)
      }
      console.log('#configs.derivable.poolDeployer', configs)
      const poolDeployer = new ethers.Contract(
        configs.derivable.poolDeployer!,
        PoolDeployerAbi,
        signer
      )
      const R = settings.amountIn ? ethers.utils.parseEther(STR(settings.amountIn)) : bn(30)
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
        poolAddress,
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
        settings.searchBySymbols[0] ?? baseToken.symbol.slice(0, -1),
        settings.searchBySymbols[1] ?? baseToken.symbol.slice(1),
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
