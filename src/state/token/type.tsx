// import configs from '../config/configs'

import { CHAINS } from '../../utils/constant'

export interface TokenType {
  decimals: number
  name: string
  symbol: string
  icon?: string
  logo?: string
  address: string
  isWhiteList?: boolean
  isCustomToken?: boolean
  value?: string
  hideInSearchModal?: boolean
}

export type ListTokensType = { [key: string]: TokenType }

export interface tokensState {
  tokens: {
    [key: number]: ListTokensType
  }
}

export const initialState: tokensState = {
  tokens: {
    [CHAINS.ARBITRUM]: {},
    [CHAINS.BASE]: {},
    [CHAINS.BSC]: {}
  }
}
