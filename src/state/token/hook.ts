import { useDispatch, useSelector } from 'react-redux'
import { State } from '../types'
import { useConfigs } from '../config/useConfigs'
import { addTokensReduce } from './reducer'
import { TokenType } from './type'

export const useListTokens = () => {
  const { chainId } = useConfigs()
  const { tokens } = useSelector(
    (state: State) => {
      return {
        tokens: state.tokens.tokens
      }
    }
  )
  const dispatch = useDispatch()

  const addTokenToList = (token: TokenType) => {
    dispatch(addTokensReduce({ tokens: [token], chainId }))
  }

  return {
    tokens: tokens[chainId],
    addTokenToList
  }
}
