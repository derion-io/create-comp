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
  const [amountIn, setAmountIn] = useState<any>()
  const [quoteTokenDecimal, setQuoteTokenDecimal] = useState<string>('0')
  const [windowTime, setWindowTime] = useState<string>('120') // blocks
  const [windowTimeSuggest, setWindowTimeSuggest] = useState<string[]>([])
  const [mark, setMark] = useState<string>('')
  const [markSuggest, setMarkSuggest] = useState<string[]>([])
  const [initTime, setInitTime] = useState<string>('')
  const [initTimeSuggest, setInitTimeSuggest] = useState<string[]>([])
  const [recipient, setRecipient] = useState<string>(ZERO_ADDRESS)
  const baseTokenAddress = NATIVE_ADDRESS
  const [pairAddr, setPairAddr] = useState<string>('')
  const [power, setPower] = useState<string>('2')
  const [interestRate, setInterestRate] = useState<number>(0.03) // %
  const [premiumRate, setPremiumRate] = useState<number>(0.03) // %
  const [vesting, setVesting] = useState<number>(60) // second
  const [closingFeeDuration, setClosingFeeDuration] = useState<number>(24) // hour (maturity)
  const [closingFee, setClosingFee] = useState<number>(0.03) // %

  useMemo(() => {
    if (account) {
      setRecipient(account)
    }
  }, [account])

  const twoDecimal = (a: any) =>
    (a.toString().match(/e/)
      ? Number(a.toString().match(/[^e]*/)[0])
      : a
    ).toFixed(0)

  const suggestConfigs = (qTIndex: string, qTDecimal: string) => {
    // const filterExistPoolData = Object.entries(pools).filter(([key]) => {
    //   return key.includes(pairAddr.substring(2).toLowerCase())
    // })
    const filterExistPoolData: any = []
    const wTimeArr = []
    const markArr = []
    const iTimeArr = []
    for (let index = 0; index < filterExistPoolData.length; index++) {
      const poolData = filterExistPoolData[index][1]
      const oracle = poolData.ORACLE
      if (
        (qTIndex === '0' && oracle.includes('0x0')) ||
        (qTIndex === '1' && oracle.includes('0x8'))
      ) {
        wTimeArr.push(bn(oracle).shr(192).toNumber().toString())
        if (parseInt(qTDecimal) === 6) {
          markArr.push(
            Math.pow(poolData.MARK.mul(1e6).shr(128).toNumber(), 2).toString()
          )
        } else {
          markArr.push(
            Math.pow(poolData.MARK.shr(128).toNumber(), 2).toString()
          )
        }
        iTimeArr.push(poolData.INIT_TIME.toNumber().toString())
      }
    }
    setQuoteTokenDecimal(qTDecimal)
    setWindowTime(wTimeArr[0])
    setWindowTimeSuggest(wTimeArr)
    setMark(markArr[0])
    setMarkSuggest(markArr)
    setInitTime(iTimeArr[0])
    setInitTimeSuggest(iTimeArr)
  }

  return (
    <div className={`ddl-pool-page ${UNDER_CONSTRUCTION && 'blur-3'}`}>
      <Card className='ddl-pool-page__config-card'>
        <div className='ddl-pool-page__head'>
          <ButtonGrey className='ddl-pool-page__head--back-btn'>
            <IconArrowLeft />
          </ButtonGrey>
          <Text fontWeight={700} fontSize={18}>
            Create pool
          </Text>
        </div>

        <div className='ddl-pool-page__content'>
          <div className='ddl-pool-page__content--left'>
            <OracleConfigBox
              pairAddr={pairAddr}
              power={power}
              windowTime={windowTime}
              vesting={vesting}
              interestRate={interestRate}
              closingFee={closingFee}
              closingFeeDuration={closingFeeDuration}
              premiumRate={premiumRate}
              setPairAddr={setPairAddr}
              setWindowTime={setWindowTime}
              setInterestRate={setInterestRate}
              setPower={setPower}
              setVesting={setVesting}
              setClosingFee={setClosingFee}
              setClosingFeeDuration={setClosingFeeDuration}
              setPremiumRate={setPremiumRate}
            />
          </div>
          <div className='ddl-pool-page__content--right'>
            <PoolCreateInfo
              pairAddr={pairAddr}
              windowTime={windowTime}
              power={power}
              interestRate={interestRate}
              premiumRate={premiumRate}
              vesting={vesting}
              closingFee={closingFee}
              closingFeeDuration={closingFeeDuration}
              amountIn={amountIn}
              setAmountIn={setAmountIn}
              reserveToken='PLD'
            />
          </div>
        </div>
      </Card>
      {/* <PoolCreateInfo /> */}
    </div>
  )
}
