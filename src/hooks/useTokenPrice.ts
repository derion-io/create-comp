import { useConfigs } from '../state/config/useConfigs'
import { useTokenPrice } from '../state/pools/hooks/useTokenPrice'
import { NUM } from '../utils/helpers'
import { NATIVE_ADDRESS } from '../utils/constant'

export const useNativePrice = () => {
  const { configs } = useConfigs()
  const { prices } = useTokenPrice()
  const nativePrice = NUM(prices[configs.wrappedTokenAddress] || prices[NATIVE_ADDRESS])
  if (nativePrice > 0) {
    return { data: nativePrice }
  }
  return { data: configs.nativePriceUSD ?? 1600 }
}
