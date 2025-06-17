import { BigNumber } from 'ethers'
import { TokenType } from '../token/type'
export type ChainLinkPriceFeedData = {
  answer: BigNumber
  answeredInRound: BigNumber
  roundId: BigNumber
  startedAt: BigNumber
  updatedAt: BigNumber
}
export type PoolSettingsType = {
  pairAddress: string
  isChainLink: boolean
  chainLinkDecimals?: number
  chainLinkDesc?: string
  chainLinkLatestRoundData?: ChainLinkPriceFeedData,
  power: string
  window: string
  windowBlocks?: string
  interestRate: string
  premiumRate: string
  vesting?: string
  maturityHours?: string
  closingFee?: string
  openingFee?: string
  amountIn?: string
  reserveToken: string
  searchBySymbols: string[]
  gasUsed: string
  markPrice: string
  R?: string | string
  x?: string
  poolAddress?: string
  baseToken?: TokenType
  quoteToken?: TokenType
  QTI?: 0 | 1
  factory?: string
  slot0?: any
  r0?: BigNumber
  r1?: BigNumber
  tokens?: TokenType[]
  fee?: number
}

export const initialState: PoolSettingsType = {
  searchBySymbols: ['', ''],
  isChainLink: false,
  pairAddress: '',
  window: '120',
  windowBlocks: '40',
  power: '8',
  interestRate: '0.3',
  openingFee: '0',
  premiumRate: '0',
  reserveToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  // reserveToken: ''0xBa95100a0c3abaD1e10414Be77347D3D0900D8c2'', // PlayDerivable
  gasUsed: '0',
  markPrice: '0',
  x: '0'
}
