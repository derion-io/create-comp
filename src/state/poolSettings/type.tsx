import { type } from 'os'

export type PoolSettingsType = {
  pairAddress: string
  power: number
  window: number
  windowBlocks?: number
  interestRate: number
  premiumRate: number
  vesting: number
  closingFeeDuration: number
  closingFee: number
  openingFee: number
  amountIn: string | number
  reserveToken: string
  errorMessage?: string
  gasUsed: number
  markPrice: number
  R?: string | number
  x?: number
  newPoolAddress?: string
}

export const initialState: PoolSettingsType = {
  pairAddress: '',
  window: 120,
  power: 2,
  interestRate: 0.03,
  premiumRate: 0.3,
  vesting: 60,
  openingFee: 0,
  closingFee: 0.3,
  closingFeeDuration: 24,
  amountIn: '0',
  // reserveToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native
  reserveToken: '0xBa95100a0c3abaD1e10414Be77347D3D0900D8c2', // PlayDerivable
  errorMessage: '',
  gasUsed: 0,
  markPrice: 0,
  x: 0
}
