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
import { TIME_TO_REFRESH_STATE } from '../../utils/constant'
import { CreatePool } from '../../pages/CreatePool'

export const App = () => {
  const { tokens } = useListTokens()
  const { poolGroups } = useListPool()
  const { fetchBalanceAndAllowance } = useWalletBalance()
  const { account } = useWeb3React()
  const { chainId, location } = useConfigs()
  const chainIdRef = useRef(null)
  const { initListPool } = useListPool()

  useEffect(() => {
    initListPool(account)
    const intervalId = setInterval(() => {
      initListPool(account)
    }, TIME_TO_REFRESH_STATE)
    return () => clearInterval(intervalId)
  }, [chainId, account])

  useEffect(() => {
    if (account && Object.keys(tokens).length > 0) {
      fetchBalanceAndAllowance(Object.keys(tokens))
    }
  }, [account, tokens])

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
    <div className='exposure-interface app'>
      <input type='hidden' value={chainId} ref={chainIdRef} />
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
