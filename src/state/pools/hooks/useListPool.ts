import { useConfigs } from '../../config/useConfigs'
import {
  addPoolGroupsWithChain,
  addPoolsWithChain,
  setPoolGroupsWithChain,
  setPoolsWithChain
} from '../reducer'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../types'
import { addTokensReduce, setTokensReduce } from '../../token/reducer'
import { useSwapHistory } from '../../wallet/hooks/useSwapHistory'
import { TokenType } from 'derivable-engine/dist/types'
import { isAddress } from 'ethers/lib/utils'

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
  const setNewResource = (data: any, account: string) => {
    console.log('#setNewResource', data)
    dispatch(addTokensReduce({ tokens: data.tokens, chainId }))
    dispatch(setPoolGroupsWithChain({ poolGroups: data.poolGroups, chainId }))
    dispatch(setPoolsWithChain({ pools: data.pools, chainId }))
  }
  const initListPool = async (account: string, baseToken?: TokenType) => {
    if (
      ddlEngine &&
      baseToken &&
      baseToken.address &&
      isAddress(baseToken.address)
    ) {
      console.log('#search-input', baseToken.address)
      const searchResults = await ddlEngine?.RESOURCE.searchIndex(
        baseToken.address
      )
      console.log('#searchResults', searchResults)
      let poolAddresses: string[] = []
      Object.keys(searchResults).map((key) => {
        const poolSearch = searchResults[key]
        if (poolGroups[key]?.pools) return
        poolAddresses = [
          ...poolAddresses,
          ...poolSearch.pools.map((pool: any) => pool?.poolAddress)
        ]
      })
      if (poolAddresses.length === 0) {
        dispatch(setPoolGroupsWithChain({ poolGroups: {}, chainId }))
        dispatch(setPoolsWithChain({ pools: {}, chainId }))
        return
      }
      // eslint-disable-next-line no-unused-expressions
      ddlEngine?.RESOURCE.generateData({ poolAddresses, transferLogs: [] })
        .then((data) => {
          console.log('data')
          setNewResource(data, account)
        })
        .catch((e) => {
          console.log(e)
        })
      // ddlEngine.RESOURCE.searchIndex(baseToken.address).then((_data: any) => {
      //   const data = _data[Object.keys(_data)[0]]
      //   console.log('#search', data, _data)
      //   dispatch(
      //     addTokensReduce({
      //       tokens: [...data.pairInfo.token0, ...data.pairInfo.token1],
      //       chainId
      //     })
      //   )
      //   dispatch(addPoolGroupsWithChain({ poolGroups: data, chainId }))
      //   dispatch(addPoolsWithChain({ pools: data.pools, chainId }))
      // })
      // ddlEngine.RESOURCE.generateData({
      //   poolAddresses: _poolsAddress,
      //   transferLogs: []
      // }).then((data: any) => {
      //   console.log('#getWhiteListResource', data)
      //   dispatch(addTokensReduce({ tokens: data.tokens, chainId }))
      //   dispatch(
      //     addPoolGroupsWithChain({ poolGroups: data.poolGroups, chainId })
      //   )
      //   dispatch(addPoolsWithChain({ pools: data.pools, chainId }))
      // })
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
