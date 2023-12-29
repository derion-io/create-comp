// eslint-disable-next-line no-unused-vars
import { createSlice, PayloadAction, current } from '@reduxjs/toolkit'
import { PoolSettingsType, initialState } from './type'

export const tokens = createSlice({
  name: 'poolSettings',
  initialState,
  reducers: {
    setPoolSettings(state, action: PayloadAction<Partial<PoolSettingsType>>) {
      // merge the new poolSettings with the existing state
      if (action.payload.R) action.payload.amountIn = action.payload.R
      else if (action.payload.amountIn)
        action.payload.R = action.payload.amountIn

      return { ...state, ...action.payload }
    }
  }
})

// Actions
export const { setPoolSettings } = tokens.actions

export default tokens.reducer
