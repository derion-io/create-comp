import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../types'
import { useListTokens } from '../../token/hook'
import { useEffect } from 'react'
import { addTokenPriceWithChain } from '../reducer'
import { useConfigs } from '../../config/useConfigs'
import { isAddress } from 'ethers/lib/utils'
import { NATIVE_ADDRESS } from '../../../utils/constant'
import _ from 'lodash'
import { bn } from '../../../utils/helpers'

export const useTokenPrice = () => {
  const { chainId } = useConfigs()
  const { prices } = useSelector((state: State) => {
    return {
      prices: state.pools.prices
    }
  })

  return {
    prices: prices[chainId]
  }
}

export const useFetchTokenPrice = () => {
  const { tokens } = useListTokens()
  const { chainId, configs, ddlEngine } = useConfigs()
  const dispatch = useDispatch()

  useEffect(() => {
    fetchPrice()
  }, [ddlEngine, tokens, chainId, configs.name])

  const fetchPrice = async () => {
    if (configs.name) {
      const tokenAddress = _.uniq(
        [...Object.keys(tokens), configs.wrappedTokenAddress].filter((a) => {
          return isAddress(a) && a !== NATIVE_ADDRESS
        })
      )
      console.log('#usetokenprice', tokenAddress, tokens)
      if (ddlEngine?.PRICE && tokenAddress.length > 0) {
        // TODO: this should not be here
        await ddlEngine.RESOURCE.getWhiteListResource([])

        ddlEngine.PRICE.getTokenPriceByRoutes()
          .then((data: any) => {
            console.log('#usetokenprice1', data, tokenAddress, tokens)
            dispatch(
              addTokenPriceWithChain({
                prices: data,
                chainId
              })
            )
          })
          .catch((e) => {
            console.log('#usetokenprice2', e)
            console.error(e)
            const data = {}
            tokenAddress.map((a: string) => {
              data[a] = '1'
            })
            addTokenPriceWithChain({
              prices: data,
              chainId
            })
          })
      }
    }
  }
}
