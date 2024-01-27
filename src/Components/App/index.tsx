import React, { useEffect, useRef } from 'react'
import './style.scss'
import 'react-toastify/dist/ReactToastify.css'
import { matchPath } from 'react-router-dom'
import { useListTokens } from '../../state/token/hook'
import { useWalletBalance } from '../../state/wallet/hooks/useBalances'
import { useWeb3React } from '../../state/customWeb3React/hook'
import { ToastContainer } from 'react-toastify'
import { useConfigs } from '../../state/config/useConfigs'
import { useListPool } from '../../state/pools/hooks/useListPool'
import { UNDER_CONSTRUCTION } from '../../utils/constant'
import { CreatePool } from '../../pages/CreatePool'
import { useFetchTokenPrice } from '../../state/pools/hooks/useTokenPrice'
import { UnderConstruction } from '../UnderConstruction'
import { useFetchFeeData } from '../../state/pools/hooks/useFeeData'

export const App = () => {
  const { tokens } = useListTokens()
  const { fetchBalanceAndAllowance } = useWalletBalance()
  const { chainId } = useWeb3React()
  const { location, ddlEngine } = useConfigs()
  const chainIdRef = useRef(null)
  // const { initListPool } = useListPool()
  useFetchTokenPrice()
  useFetchFeeData()
  // useEffect(() => {
  //   initListPool(account)
  //   const intervalId = setInterval(() => {
  //     initListPool(account)
  //   }, TIME_TO_REFRESH_STATE)
  //   return () => clearInterval(intervalId)
  // }, [ddlEngine, configs.name])

  useEffect(() => {
    fetchBalanceAndAllowance(Object.keys(tokens))
  }, [ddlEngine, tokens])

  const renderAppContent = () => {
    switch (true) {
      case isMatchWithPath('/pools/create'):
        return <CreatePool />
      default:
        return <CreatePool />
    }
  }

  const isMatchWithPath = (path: string) => {
    return !!matchPath(location.pathname, {
      path,
      exact: true,
      strict: false
    })
  }

  return (
    <div className='ddl-pool-page app'>
      <input type='hidden' value={chainId} ref={chainIdRef} />
      {UNDER_CONSTRUCTION && <UnderConstruction />}
      {renderAppContent()}
      <ToastContainer
        position='top-right'
        autoClose={5000}
        rtl={false}
        closeOnClick={false}
        draggable
        theme='dark'
      />
    </div>
  )
}
