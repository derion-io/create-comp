import { useConfigs } from '../../config/useConfigs'
import { addPoolsWithChain } from '../reducer'
import { useDispatch, useSelector } from 'react-redux'
// eslint-disable-next-line no-unused-vars
import { State } from '../../types'
import { addTokensReduce } from '../../token/reducer'
import { useSwapHistory } from '../../wallet/hooks/useSwapHistory'

export const useListPool = () => {
  const { pools } = useSelector((state: State) => {
    return {
      pools: state.pools.pools
    }
  })
  const { chainId, ddlEngine } = useConfigs()
  const dispatch = useDispatch()
  const { updateSwapTxsHandle } = useSwapHistory()

  const initListPool = async (account: string) => {
    if (ddlEngine) {
      ddlEngine.RESOURCE.getResourceCached(account).then((data: any) => {
        dispatch(addTokensReduce({ tokens: data.tokens, chainId }))
        dispatch(addPoolsWithChain({ pools: data.poolGroups, chainId }))
        updateSwapTxsHandle(account, data.swapLogs)
      })
      ddlEngine.RESOURCE.getNewResource(account).then((data: any) => {
        dispatch(addTokensReduce({ tokens: data.tokens, chainId }))
        dispatch(addPoolsWithChain({ pools: data.poolGroups, chainId }))
        updateSwapTxsHandle(account, data.swapLogs)
      })
    }
  }

  return { initListPool, updateSwapTxsHandle, pools: pools[chainId] }
}
