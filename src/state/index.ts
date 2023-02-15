import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import customWeb3ReactReduce from './customWeb3React/reducer'
import configReduce from './config/reducer'
import walletReduce from './wallet/reducer'
import tokenReduce from './token/reducer'
import poolsReduce from './pools/reducer'

export const store = createStore(
  combineReducers({
    pools: poolsReduce,
    web3React: customWeb3ReactReduce,
    configs: configReduce,
    wallet: walletReduce,
    tokens: tokenReduce
  }),
  applyMiddleware(thunk)
)
