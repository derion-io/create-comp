import { BigNumber } from 'ethers'
import { ListTokensType } from '../token/type'
import { SUPPORTED_CHAINS } from '../../utils/constant'

export type BalancesType = { [key: string]: BigNumber }
export type AllowancesType = { [key: string]: BigNumber }

export type ParseLogType = {
  address: string
  name: string
  topic: string
  args: any
}

export type FeeDataType = {
  gasPrice: BigNumber
  lastBaseFeePerGas: BigNumber
  maxFeePerGas: BigNumber
  maxPriorityFeePerGas: BigNumber
}

export interface resourcesState {
  poolGroups: {
    [key: number]: { [key: string]: PoolGroupType }
  }
  pools: {
    [key: number]: { [key: string]: PoolType }
  }
  tokens: {
    [key: string]: ListTokensType
  }
  prices: {
    [key: number]: { [key: string]: string }
  }
  feeData: {
    [key: string]: { [key: string]: FeeDataType }
  }
  swapLogs: { [key: string]: any[] }
}

// export type PoolType = {
//   pool: string
//   logic: string
//   cTokenPrice: number
//   baseSymbol: string
//   states: any
//   baseToken: string
//   quoteToken: string
//   cToken: string
//   powers: number[]
//   dTokens: string[]
//   priceToleranceRatio: BigNumber
//   quoteSymbol: string
//   rentRate: BigNumber
//   deleverageRate: BigNumber
//   poolAddress: string
//   quoteId: number
//   baseId: number
//   basePrice: string
//   cPrice: number
//   ORACLE: string
//   MARK: BigNumber
//   INIT_TIME: BigNumber
//   TOKEN_R: string
// }

export type PoolType = any

export type PoolGroupType = any

export interface poolsState {
  poolGroups: {
    [key: number]: { [key: string]: PoolGroupType }
  }
  pools: {
    [key: number]: { [key: string]: PoolType }
  }
  tokens: {
    [key: string]: ListTokensType
  }
  prices: {
    [key: number]: { [key: string]: BigNumber }
  }
  feeData: {
    [key: string]: { [key: string]: FeeDataType }
  }
  swapLogs: { [key: string]: any[] }
}

const initDataEachChain = Object.fromEntries(SUPPORTED_CHAINS.map(chainId => ([chainId, {}])))

export const initialState: poolsState = {
  poolGroups: initDataEachChain,
  pools: initDataEachChain,
  tokens: initDataEachChain,
  prices: initDataEachChain,
  feeData: initDataEachChain,
  swapLogs: {}
}
