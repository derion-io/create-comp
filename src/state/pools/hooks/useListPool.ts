import { useConfigs } from '../../config/useConfigs'
import { addPoolGroupsWithChain, addPoolsWithChain } from '../reducer'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../types'
import { addTokensReduce } from '../../token/reducer'
import { useSwapHistory } from '../../wallet/hooks/useSwapHistory'
import { isEthereumAddress } from '../../../utils/helpers'

export const useListPool = () => {
  const { poolGroups, pools } = useSelector((state: State) => {
    return {
      poolGroups: state.pools.poolGroups,
      pools: state.pools.pools
    }
  })
  const { chainId, ddlEngine } = useConfigs()
  const dispatch = useDispatch()
  const { updateSwapTxsHandle } = useSwapHistory()

  const initListPool = async (account: string, poolsAddress: string[] = []) => {
    const _poolsAddress = poolsAddress.filter((ad) => isEthereumAddress(ad))
    if (ddlEngine && _poolsAddress.length > 0) {
      ddlEngine.RESOURCE.getWhiteListResource(_poolsAddress).then(
        (data: any) => {
          console.log('#getWhiteListResource', data)
          dispatch(addTokensReduce({ tokens: data.tokens, chainId }))
          dispatch(
            addPoolGroupsWithChain({ poolGroups: data.poolGroups, chainId })
          )
          dispatch(addPoolsWithChain({ pools: data.pools, chainId }))
        }
      )
      // ddlEngine.RESOURCE.getResourceCached(account).then((data: any) => {
      //   dispatch(addTokensReduce({ tokens: data.tokens, chainId }))
      //   dispatch(
      //     addPoolGroupsWithChain({ poolGroups: data.poolGroups, chainId })
      //   )
      //   dispatch(addPoolsWithChain({ pools: data.pools, chainId }))
      //   updateSwapTxsHandle(account, data.swapLogs)
      // })
      // ddlEngine.RESOURCE.getNewResource(account).then((data: any) => {
      //   dispatch(addTokensReduce({ tokens: data.tokens, chainId }))
      //   dispatch(
      //     addPoolGroupsWithChain({ poolGroups: data.poolGroups, chainId })
      //   )
      //   dispatch(addPoolsWithChain({ pools: data.pools, chainId }))
      //   updateSwapTxsHandle(account, data.swapLogs)
      // })
    }
  }

  return {
    initListPool,
    updateSwapTxsHandle,
    poolGroups: poolGroups[chainId],
    pools: pools[chainId]
  }
}
