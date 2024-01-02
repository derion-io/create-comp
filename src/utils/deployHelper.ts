import { BigNumber } from 'ethers'
import {
  Q128,
  Q256M,
  Q64
} from './constant'
import { bn, numberToWei } from './helpers'

export function feeToOpenRate(fee: any) {
  return bn(((1 - fee) * 10000).toFixed(0))
    .shl(128)
    .div(10000)
}

export function findFetcher(fetchers: any, factory: string): any[] {
  const fs = Object.keys(fetchers)
  let defaultFetcher = [null, null]
  for (const f of fs) {
    if (!fetchers[f].factory?.length) {
      defaultFetcher = [f, fetchers[f]?.type]
      continue
    }
    if (fetchers[f].factory?.includes(factory)) {
      return [f, fetchers[f]?.type]
    }
  }
  return defaultFetcher
}

export function mulDivNum(a: any, b: any, precision = 4) {
  const al = a.toString().length
  const bl = b.toString().length
  const d = al - bl
  if (d > 0) {
    b = b.mul(numberToWei(1, d))
  } else if (d < 0) {
    a = a.mul(numberToWei(1, -d))
  }
  a = a.mul(numberToWei(1, precision))
  let c = a.div(b)
  c = Math.round(c)
  return mdp(c, d - precision)
}

export function _powu(x: any, y: any) {
  let z = y.and(1).gt(0) ? x : Q128
  let x1 = x
  for (let y1 = y.shr(1); y1.gt(0); y1 = y1.shr(1)) {
    x1 = x1.mul(x1).div(Q128)
    if (y1.and(1).gt(0)) {
      z = z.mul(x1).div(Q128)
    }
  }
  return z
}

export function mulDivRoundingUp(
  a: BigNumber | any,
  b: BigNumber | any,
  x: BigNumber | any
) {
  let result = a.mul(b).div(x)
  if (result.mul(x).div(b).lt(a)) result = result.add(1)
  return result
}

export function _v(xk: any, r: any, R: any) {
  if (R.shr(1).gte(r)) {
    return mulDivRoundingUp(r, Q128, xk)
  }
  const denominator = R.sub(r).mul(xk.shl(2)).div(Q128)
  return mulDivRoundingUp(R, R, denominator)
}

export function _market(K: any, MARK: any, decayRateX64: any, price: any) {
  let xkA = _powu(price.mul(Q128).div(MARK), K)
  const xkB = Q256M.div(xkA).mul(Q64).div(decayRateX64)
  xkA = xkA.mul(Q64).div(decayRateX64)
  return { xkA, xkB }
}

export function calculateInitParamsFromPrice(config: any, price: any, R: any) {
  const market = _market(config.K, config.MARK, Q64, price)
  const a = _v(market.xkA, R.div(3), R)
  const b = _v(market.xkB, R.div(3), R)
  return { R, a, b }
}

export const mdp = function (num: any, n: any) {
  let zeros: any
  zeros = function (n: any) {
    return new Array(n + 1).join('0')
  }
  let frac, int, neg, ref
  if (n === 0) {
    return num
  }
  ;(ref = ('' + num).split('.')), (int = ref[0]), (frac = ref[1])
  int || (int = '0')
  frac || (frac = '0')
  neg = int[0] === '-' ? '-' : ''
  if (neg) {
    int = int.slice(1)
  }
  if (n > 0) {
    if (n > frac.length) {
      frac += zeros(n - frac.length)
    }
    int += frac.slice(0, n)
    frac = frac.slice(n)
  } else {
    n = n * -1
    if (n > int.length) {
      int = zeros(n - int.length) + int
    }
    frac = int.slice(n * -1) + frac
    int = int.slice(0, n * -1)
  }
  while (int[0] === '0') {
    int = int.slice(1)
  }
  while (frac[frac.length - 1] === '0') {
    frac = frac.slice(0, -1)
  }
  return neg + (int || '0') + (frac.length ? '.' + frac : '')
}

// export async function deployPool(
//   settings: PoolSettingsType,
//   chainID: string,
//   provider: ethers.providers.JsonRpcProvider,
//   deployer: ethers.Signer,
//   updatePoolSettings: (x: any) => void
// ) {
//   const gasPrice = gasPrices[chainID] ?? 1e9

//   const configs = await fetch(
//     `https://raw.githubusercontent.com/derivable-labs/configs/dev/${chainID}/network.json`
//   ).then((res) => res.json())

//   const TOKEN_R =
//     settings.reserveToken == 'PLD'
//       ? configs.derivable.playToken
//       : settings.reserveToken !== ''
//       ? settings.reserveToken
//       : configs.wrappedTokenAddress

//   if (TOKEN_R == configs.derivable.playToken) {
//     console.log('TOKEN_R', 'PLD')
//   } else if (TOKEN_R == configs.wrappedTokenAddress) {
//     console.log('TOKEN_R', 'WETH')
//   } else {
//     console.log('TOKEN_R', TOKEN_R)
//   }

//   let uniswapPair = new ethers.Contract(
//     settings.pairAddress,
//     jsonUniswapV3Pool.abi,
//     provider
//   )

//   const factory = await uniswapPair.callStatic.factory()
//   const [FETCHER, fetcherType] = findFetcher(configs.fetchers, factory)
//   const exp = fetcherType?.endsWith('3') ? 2 : 1
//   if (exp == 1) {
//     // use the univ2 abi
//     uniswapPair = new ethers.Contract(
//       settings.pairAddress,
//       jsonUniswapV2Pool.abi,
//       provider
//     )
//   }
//   if (FETCHER != ZERO_ADDRESS) {
//     console.log('FETCHER', FETCHER)
//   }

//   const [slot0, token0, token1] = await Promise.all([
//     exp == 2 ? uniswapPair.callStatic.slot0() : undefined,
//     uniswapPair.callStatic.token0(),
//     uniswapPair.callStatic.token1()
//   ])
//   const ct0 = new ethers.Contract(token0, jsonERC20.abi, provider)
//   const ct1 = new ethers.Contract(token1, jsonERC20.abi, provider)
//   const [decimals0, decimals1, symbol0, symbol1] = await Promise.all([
//     ct0.callStatic.decimals(),
//     ct1.callStatic.decimals(),
//     ct0.callStatic.symbol(),
//     ct1.callStatic.symbol()
//   ])

//   // detect QTI
//   let QTI
//   if (QTI == null && symbol0.includes('USD')) {
//     QTI = 0
//   }
//   if (QTI == null && symbol1.includes('USD')) {
//     QTI = 1
//   }
//   if (QTI == null && configs.stablecoins.includes(token0)) {
//     QTI = 0
//   }
//   if (QTI == null && configs.stablecoins.includes(token1)) {
//     QTI = 1
//   }
//   if (QTI == null && configs.wrappedTokenAddress == token0) {
//     QTI = 0
//   }
//   if (QTI == null && configs.wrappedTokenAddress == token1) {
//     QTI = 1
//   }
//   if (QTI == null) {
//     QTI = 0
//     // throw new Error('unable to detect QTI')
//   }

//   const K = settings.power * exp
//   const prefix = exp == 2 ? '√' : ''

//   console.log(
//     'INDEX',
//     QTI == 1
//       ? `${prefix}${symbol0}/${symbol1}`
//       : `${prefix}${symbol1}/${symbol0}`,
//     'x' + K
//   )

//   const SCAN_API_KEY = {
//     42161: process.env.REACT_APP_ARBISCAN_API_KEY,
//     56: process.env.REACT_APP_BSCSCAN_API_KEY
//   }

//   // detect WINDOW
//   let logs
//   const EPOCH = 500 * 60
//   if ((slot0 && !settings.window) || (!slot0 && !settings?.windowBlocks)) {
//     // get the block a day before
//     const now = Math.floor(new Date().getTime() / 1000)
//     const anEpochAgo = now - EPOCH
//     const blockEpochAgo = await fetch(
//       `${configs.scanApi}?module=block&action=getblocknobytime&timestamp=${anEpochAgo}&closest=before&apikey=${SCAN_API_KEY[chainID]}`
//     )
//       .then((x) => x.json())
//       .then((x) => Number(x?.result))

//     const SWAP_TOPIC = {
//       2: '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
//       3: '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67'
//     }

//     logs = await fetch(
//       `${configs.scanApi}?module=logs&action=getLogs&address=${settings.pairAddress}` +
//         `&topic0=${SWAP_TOPIC[slot0 ? 3 : 2]}` +
//         `&fromBlock=${blockEpochAgo}&apikey=${SCAN_API_KEY[chainID]}`
//     )
//       .then((x) => x.json())
//       .then((x) => x?.result)

//     if (!logs?.length) {
//       updatePoolSettings({
//         errorMessage: 'No transaction for a whole day'
//       })
//       // throw new Error('no transaction for a whole day')
//     }
//   }

//   let WINDOW
//   if (slot0) {
//     if (logs?.length > 0) {
//       const txFreq = EPOCH / logs.length
//       WINDOW = Math.ceil(Math.sqrt(txFreq / 60)) * 60
//     } else {
//       WINDOW = settings.window
//     }
//     if (WINDOW) console.log('WINDOW', WINDOW / 60, 'min(s)')
//     try {
//       await uniswapPair.callStatic.observe([0, WINDOW])
//     } catch (err) {
//       if (err.reason == 'OLD') {
//         updatePoolSettings({
//           ...settings,
//           errorMessage: 'WINDOW too long'
//         })
//         // throw new Error('WINDOW too long')
//       }
//       // throw err
//       updatePoolSettings({
//         errorMessage: err.reason ?? err.error ?? err
//       })
//     }
//   } else {
//     if (logs?.length > 0) {
//       const range = logs[logs.length - 1].blockNumber - logs[0].blockNumber + 1
//       const txFreq = range / logs.length
//       WINDOW = Math.floor(txFreq / 10) * 10
//       WINDOW = Math.max(WINDOW, 20)
//       WINDOW = Math.min(WINDOW, 256)
//     } else {
//       WINDOW = settings.windowBlocks
//     }
//     console.log('WINDOW', WINDOW, 'block(s)')
//   }

//   const ORACLE = ethers.utils.hexZeroPad(
//     bn(QTI)
//       .shl(255)
//       .add(bn(WINDOW).shl(256 - 64))
//       .add(settings.pairAddress)
//       .toHexString(),
//     32
//   )

//   let MARK, price

//   if (slot0) {
//     MARK = slot0.sqrtPriceX96.shl(32)
//     if (QTI == 0) {
//       MARK = Q256M.div(MARK)
//     }
//     price = MARK.mul(MARK)
//   } else {
//     const [r0, r1] = await uniswapPair.getReserves()
//     if (QTI == 0) {
//       MARK = r0.mul(Q128).div(r1)
//     } else {
//       MARK = r1.mul(Q128).div(r0)
//     }
//     price = MARK
//   }
//   const decShift = QTI == 0 ? decimals1 - decimals0 : decimals0 - decimals1
//   if (decShift > 0) {
//     price = price.mul(numberToWei(1, decShift))
//   } else if (decShift < 0) {
//     price = price.div(numberToWei(1, -decShift))
//   }
//   console.log('MARK', mulDivNum(price, Q128.pow(exp)))

//   const INTEREST_HL = rateToHL(settings.interestRate, settings.power)

//   console.log(
//     'INTEREST_HL',
//     (INTEREST_HL / SECONDS_PER_DAY).toFixed(2),
//     'day(s)'
//   )

//   const PREMIUM_HL = rateToHL(
//     settings.premiumRate ? settings.premiumRate : 0,
//     settings.power
//   )

//   if (settings.premiumRate) {
//     console.log(
//       'PREMIUM_HL',
//       (PREMIUM_HL / SECONDS_PER_DAY).toFixed(2),
//       'day(s)'
//     )
//   }

//   const config = {
//     FETCHER,
//     ORACLE,
//     TOKEN_R,
//     MARK,
//     K: bn(K),
//     INTEREST_HL,
//     PREMIUM_HL,
//     MATURITY: settings.closingFeeDuration,
//     MATURITY_VEST: settings.vesting,
//     MATURITY_RATE: feeToOpenRate(settings.closingFee ?? 0),
//     OPEN_RATE: feeToOpenRate(settings.openingFee ?? 0)
//   }

//   console.log(
//     'MATURITY',
//     (config.MATURITY / SECONDS_PER_HOUR).toFixed(2),
//     'hr(s)'
//   )
//   console.log('VESTING', (config.MATURITY_VEST / 60).toFixed(2), 'min(s)')
//   console.log(
//     'CLOSE_FEE',
//     Q128.sub(config.MATURITY_RATE)
//       .mul(PRECISION * 100)
//       .shr(128)
//       .toNumber() / PRECISION,
//     '%'
//   )
//   console.log(
//     'OPEN_FEE',
//     Q128.sub(config.OPEN_RATE)
//       .mul(PRECISION * 100)
//       .shr(128)
//       .toNumber() / PRECISION,
//     '%'
//   )

//   // Create Pool
//   const poolFactory = new ethers.Contract(
//     configs.derivable.poolFactory,
//     poolFactoryAbi,
//     deployer
//   )

//   // init the pool
//   const R = ethers.utils.parseEther(String(settings.amountIn ?? 0.0001))
//   const initParams = calculateInitParamsFromPrice(config, MARK, R)

//   const utr = new ethers.Contract(
//     configs.helperContract.utr,
//     univeralTokenRouterAbi,
//     deployer
//   )
//   const helper = new ethers.Contract(
//     configs.derivable.helper ?? configs.derivable.stateCalHelper,
//     helperAbi,
//     deployer
//   )
//   // get pool address

//   const poolAddress = await poolFactory.callStatic.createPool(config)
//   const pool = new ethers.Contract(poolAddress, poolBaseAbi, deployer)

//   console.log('New Pool Address:', poolAddress)

//   let params

//   if (TOKEN_R != configs.wrappedTokenAddress) {
//     const deployerAddress = await deployer.getAddress()

//     const rERC20 = new ethers.Contract(
//       TOKEN_R,
//       require('@uniswap/v2-core/build/ERC20.json').abi,
//       deployer
//     )
//     const rAllowance = await rERC20.allowance(deployerAddress, utr.address)
//     if (rAllowance.lt(R)) {
//       updatePoolSettings({
//         ...settings,
//         errorMessage: 'Token reserve approval required'
//       })
//       // throw new Error('!!! Token reserve approval required !!!')
//     }
//     const payment = {
//       utr: utr.address,
//       payer: deployerAddress,
//       recipient: deployerAddress
//     }
//     const PAYMENT = 0
//     params = [
//       [],
//       [
//         {
//           inputs: [],
//           code: poolFactory.address,
//           data: (await poolFactory.populateTransaction.createPool(config)).data
//         },
//         {
//           inputs: [
//             {
//               mode: PAYMENT,
//               eip: 20,
//               token: TOKEN_R,
//               id: 0,
//               amountIn: R,
//               recipient: pool.address
//             }
//           ],
//           code: poolAddress,
//           data: (await pool.populateTransaction.init(initParams, payment)).data
//         }
//       ],
//       { gasPrice }
//     ]
//   } else {
//     params = [
//       config,
//       initParams,
//       configs.derivable.poolFactory,
//       { value: R, gasPrice }
//     ]
//   }

//   const gasUsed =
//     TOKEN_R != configs.wrappedTokenAddress
//       ? await utr.estimateGas.exec(...params)
//       : await helper.estimateGas.createPool(...params)

//   console.log('Estimated Gas:', gasUsed.toNumber().toLocaleString())

//   params[params.length - 1].gasLimit = gasUsed.mul(3).div(2)
//   updatePoolSettings({
//     gasUsed: gasUsed.toNumber()
//   })

//   try {
//     const tx =
//       TOKEN_R != configs.wrappedTokenAddress
//         ? await utr.exec(...params)
//         : await helper.createPool(...params)

//     console.log('Waiting for tx receipt...', tx.hash)

//     const rec = await tx.wait()
//     console.log('Gas Used:', rec.gasUsed.toNumber())
//     console.log('Logs:', rec.logs)
//   } catch (err) {
//     console.error(err.reason ?? err.error ?? err)
//   }
// }
