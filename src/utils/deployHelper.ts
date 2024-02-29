import { BigNumber } from 'ethers'
import {
  ZERO_ADDRESS,
  Q128,
  Q256M,
  Q64
} from './constant'
import { bn, numberToWei } from './helpers'
import { INetworkConfig } from 'derivable-engine/dist/utils/configs'

export function feeToOpenRate(fee: any) {
  return bn(((1 - fee) * 10000).toFixed(0))
    .shl(128)
    .div(10000)
}

export function findFetcher(configs: INetworkConfig, factory: string): any[] {
  const factoryConfig = configs.factory[factory] ?? configs.factory['0x']
  const fetcher = factoryConfig.fetcher ?? ZERO_ADDRESS
  const type = factoryConfig.type
  return [fetcher, type]
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
