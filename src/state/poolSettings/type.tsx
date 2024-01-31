import { BigNumber } from 'ethers'
import { type } from 'os'
import { TokenType } from '../token/type'

export type PoolSettingsType = {
  pairAddress: string
  power: string
  window: string
  windowBlocks?: string
  interestRate: string
  premiumRate: string
  vesting: string
  closingFeeDuration: string
  closingFee: string
  openingFee?: string
  amountIn?: string
  reserveToken: string
  errorMessage?: string
  searchBySymbols: string[]
  gasUsed: string
  markPrice: string
  R?: string | string
  x?: string
  newPoolAddress?: string
  baseToken?: TokenType
  quoteToken?: TokenType
  QTI?: 0 | 1
  factory?: string
  slot0?: any
  tokens?: {
    address: string,
    symbol: string,
    decimals: number,
  }[]
}

export const initialState: PoolSettingsType = {
  pairAddress: '',
  window: '120',
  power: '2',
  interestRate: '0.03',
  searchBySymbols: ['', ''],
  premiumRate: '0.3',
  vesting: '60',
  closingFee: '0.3',
  closingFeeDuration: '24',
  reserveToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  // reserveToken: ''0xBa95100a0c3abaD1e10414Be77347D3D0900D8c2'', // PlayDerivable
  errorMessage: '',
  gasUsed: '0',
  markPrice: '0',
  x: '0',
}
