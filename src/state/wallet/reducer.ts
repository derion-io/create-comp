// eslint-disable-next-line no-unused-vars
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  AllowancesType,
  BalancesType,
  initialState
} from './type'
import _ from 'lodash'
import { ZERO_ADDRESS } from '../../utils/constant'

export const tokens = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    resetBnA: (state) => {
      state.balances = {}
      state.routerAllowances = {}
      state.account = ''
    },
    updateSwapTxs: (state, action: PayloadAction<{
      account: string,
      swapLogs: any
    }>) => {
      if (!action.payload.account) return
      const logs = state.swapLogs[action.payload.account] ? [
        ...action.payload.swapLogs,
        ...state.swapLogs[action.payload.account]
      ] : action.payload.swapLogs

      state.swapLogs[action.payload.account] = _.uniqBy(logs, (l) => l.logIndex)
    },
    updateFormatedSwapTxs: (state, action: PayloadAction<{
      swapTxs: any
    }>) => {
      const logs = _.uniqBy(action.payload.swapTxs, (l: any) => l.transactionHash)
      if (_.differenceBy(logs, state.formartedSwapLogs, 'transactionHash').length) {
        state.formartedSwapLogs = logs
      }
    },
    updateBalanceAndAllowancesReduce: (
      state,
      action: PayloadAction<{
        chainId: number,
        account: string,
        balances: BalancesType,
        routerAllowances: AllowancesType,
      }>
    ) => {
      const { chainId, account, balances, routerAllowances } = action.payload
      if (!chainId || !account || account == ZERO_ADDRESS) {
        return
      }
      if (chainId !== state.chainId || account !== state.account) {
        state.balances = balances
        state.routerAllowances = routerAllowances
        state.account = account
        state.chainId = chainId
      } else {
        state.balances = {
          ...state.balances,
          ...balances
        }
        state.routerAllowances = {
          ...state.routerAllowances,
          ...routerAllowances
        }
      }
    }
  }
})

// Actions
export const {
  resetBnA,
  updateBalanceAndAllowancesReduce,
  updateSwapTxs,
  updateFormatedSwapTxs
} = tokens.actions

export default tokens.reducer
