// eslint-disable-next-line no-unused-vars
import { web3ReactState } from './customWeb3React/type'
// eslint-disable-next-line no-unused-vars
import { configsState } from './config/type'
// eslint-disable-next-line no-unused-vars
import { currentPoolState } from './currentPool/type'
// eslint-disable-next-line no-unused-vars
import { walletState } from './wallet/type'
// eslint-disable-next-line no-unused-vars
import { tokensState } from './token/type'
// eslint-disable-next-line no-unused-vars
import { poolsState } from './pools/type'
// eslint-disable-next-line no-unused-vars
import { BigNumber } from 'ethers'
import { settingsState } from './setting/type'

export interface State {
  pools: poolsState
  configs: configsState
  web3react: web3ReactState
  currentPool: currentPoolState
  wallet: walletState
  tokens: tokensState
  settings: settingsState
}

export interface PoolType {
  address: string
  address0: string
  address1: string
  creator: string
  reserve0: BigNumber
  reserve1: BigNumber
}
