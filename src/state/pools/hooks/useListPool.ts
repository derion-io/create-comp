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
    }
  }

  return {
    initListPool,
    updateSwapTxsHandle,
    poolGroups: poolGroups[chainId],
    pools: pools[chainId]
  }
}
