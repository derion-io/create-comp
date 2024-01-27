import { BigNumber } from 'ethers'
import { DEFAULT_CHAIN } from '../../utils/constant'

export type BalancesType = { [key: string]: BigNumber }
export type AllowancesType = { [key: string]: BigNumber }
export type SwapTxType = {
  transactionHash: string,
  timeStamp: number,
  oldBalances: {[key: number]: BigNumber},
  newBalances: {[key: number]: BigNumber},
  cAmount: BigNumber,
  cp: BigNumber,
  newLeverage: number,
  oldLeverage: number,
}

export interface walletState {
  chainId: number
  account: string
  balances: BalancesType
  swapLogs: {[key: string]: any[] }
  formartedSwapLogs: any[]
  routerAllowances: AllowancesType
}

export const initialState: walletState = {
  chainId: DEFAULT_CHAIN,
  account: '',
  balances: {},
  swapLogs: {},
  formartedSwapLogs: [],
  routerAllowances: {}
}
