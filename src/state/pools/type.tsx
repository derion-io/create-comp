import { BigNumber } from 'ethers'
import { ListTokensType } from '../token/type'

export type BalancesType = { [key: string]: BigNumber }
export type AllowancesType = { [key: string]: BigNumber }

export type ParseLogType = {
  address: string
  name: string
  topic: string
  args: any
}
export type PoolType = {
  pool: string,
  logic: string,
  cTokenPrice: number,
  baseSymbol: string
  states: any
  baseToken: string,
  quoteToken: string,
  cToken: string,
  powers: number[]
  dTokens: string[]
  priceToleranceRatio: BigNumber
  quoteSymbol: string
  rentRate: BigNumber
  deleverageRate: BigNumber
  poolAddress: string
  quoteId: number,
  baseId: number,
  basePrice: string
  cPrice: number,
  ORACLE: string,
  MARK: BigNumber,
  INIT_TIME: BigNumber
  TOKEN_R: string
}

export type PoolGroupType = any

export interface poolsState {
  poolGroups: {
    [key: number]: {[key: string]: PoolGroupType}
  },
  pools: {
    [key: number]: {[key: string]: PoolType}
  },
  tokens: {
    [key: string]: ListTokensType
  },
  prices: {
    [key: number]: {[key: string]: BigNumber}
  },
  swapLogs: {[key: string]: any[] }
}
const initDataEachChain = {
  56: {},
  31337: {},
  1337: {},
  97: {},
  42161: {}
}

export const initialState: poolsState = {
  poolGroups: initDataEachChain,
  pools: initDataEachChain,
  tokens: initDataEachChain,
  prices: initDataEachChain,
  swapLogs: {
  }
}
