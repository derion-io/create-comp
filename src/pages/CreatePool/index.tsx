import React, { useState, useMemo, useEffect } from 'react'
import './style.scss'
import 'react-tabs/style/react-tabs.css'
import {
  NATIVE_ADDRESS,
  UNDER_CONSTRUCTION,
  ZERO_ADDRESS
} from '../../utils/constant'
import { Card } from '../../Components/ui/Card'
import { IconArrowLeft } from '../../Components/ui/Icon'
import { ButtonGrey } from '../../Components/ui/Button'
import { useWeb3React } from '../../state/customWeb3React/hook'
import { useConfigs } from '../../state/config/useConfigs'
import { Text } from '../../Components/ui/Text'
import { bn } from '../../utils/helpers'
import { PoolCreateInfo } from '../../Components/PoolCreateInfo'
import { OracleConfigBox } from '../../Components/OracleConfigBox'

export const CreatePool = () => {
  const { account, chainId } = useWeb3React()
  const [recipient, setRecipient] = useState<string>(ZERO_ADDRESS)

  useMemo(() => {
    if (account) {
      setRecipient(account)
    }
  }, [account])

  return (
    <div className={`ddl-pool-page ${UNDER_CONSTRUCTION && 'blur-3'}`}>
      <div
        style={{
          display: 'flex',
          width: '1400px',
          gap: '2rem'
        }}
      >
        <Card
          style={{
            width: '-webkit-fill-available'
          }}
        >
          <div className='ddl-pool-page__head'>
            {/* <ButtonGrey className='ddl-pool-page__head--back-btn'>
              <IconArrowLeft />
            </ButtonGrey> */}
            <Text fontWeight={700} fontSize={18}>
              NEW POOL
            </Text>
          </div>
          <OracleConfigBox />
        </Card>
        <Card
          style={{
            width: '400px'
          }}
        >
          <PoolCreateInfo />
        </Card>
      </div>
      {/* <PoolCreateInfo /> */}
    </div>
  )
}
