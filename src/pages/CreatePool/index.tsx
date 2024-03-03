import React, { useState, useMemo, useEffect } from 'react'
import './style.scss'
import 'react-tabs/style/react-tabs.css'
import {
  UNDER_CONSTRUCTION,
  ZERO_ADDRESS
} from '../../utils/constant'
import { Card } from '../../Components/ui/Card'
import { useWeb3React } from '../../state/customWeb3React/hook'
import { Text } from '../../Components/ui/Text'
import { PoolCreateInfo } from '../../Components/PoolCreateInfo'
import { OracleConfigBox } from '../../Components/OracleConfigBox'
import { ConfigurationsBox } from '../../Components/ConfigurationsBox'
import { useWindowSize } from '../../hooks/useWindowSize'

export const CreatePool = () => {
  const { account, chainId } = useWeb3React()
  const [recipient, setRecipient] = useState<string>(ZERO_ADDRESS)
  const { width } = useWindowSize()
  useMemo(() => {
    if (account) {
      setRecipient(account)
    }
  }, [account])

  return (
    <div className={`ddl-pool-page ${UNDER_CONSTRUCTION && 'blur-3'}`}>
      <div
        style={{

        }}
        className='ddl-pool-page__wrap'
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
          {width && width < 768 ? '' : <ConfigurationsBox/>}
        </Card>
        <Card
          className='ddl-pool-page__output'
          style={{
            paddingBottom: '1rem'
          }}
        >
          <PoolCreateInfo />

        </Card>
        {width && width < 768 ? <Card
          className='ddl-pool-page__output'
          style={{
            padding: '1rem'
          }}
        >
          <ConfigurationsBox/>
        </Card> : ''}

      </div>
      {/* <PoolCreateInfo /> */}
    </div>
  )
}
