import React from 'react'
import './style.scss'
import 'react-tabs/style/react-tabs.css'
import { Card } from '../../Components/ui/Card'
import { useWalletBalance } from '../../state/wallet/hooks/useBalances'

export const CreatePool = () => {
  const { balances, routerAllowances } = useWalletBalance()
  return (
    <div className='ddl-pool-page'>
      <h1>create pool</h1>
      <Card>
        <div>balance: {JSON.stringify(balances)}</div>
      </Card>
      <Card>
        <div>routerAllowances: {JSON.stringify(routerAllowances)}</div>
      </Card>
    </div>
  )
}
