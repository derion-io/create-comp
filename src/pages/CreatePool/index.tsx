import React, { useState, useMemo } from 'react'
import { ethers } from 'ethers'
import './style.scss'
import 'react-tabs/style/react-tabs.css'
import { ZERO_ADDRESS, SECONDS_PER_DAY } from '../../utils/constant'
import { Card } from '../../Components/ui/Card'
import { IconArrowLeft, PlusIcon, SwapIcon } from '../../Components/ui/Icon'
import {
  ButtonGrey,
  ButtonExecute,
  ButtonAdd,
  ButtonBuy
} from '../../Components/ui/Button'
import { TokenIcon } from '../../Components/ui/TokenIcon'
import { TokenSymbol } from '../../Components/ui/TokenSymbol'
import { SkeletonLoader } from '../../Components/ui/SkeletonLoader'
import { Input } from '../../Components/ui/Input'
import { useWeb3React } from '../../state/customWeb3React/hook'
import { useWalletBalance } from '../../state/wallet/hooks/useBalances'
import { useListTokens } from '../../state/token/hook'
import { useListPool } from '../../state/pools/hooks/useListPool'
import { useConfigs } from '../../state/config/useConfigs'
import { Text, TextBlue } from '../../Components/ui/Text'
import { bn, numberToWei, weiToNumber, parseCallStaticError } from '../../utils/helpers'
import { formatWeiToDisplayNumber } from '../../utils/formatBalance'
import { toast } from 'react-toastify'
import { PoolCreateInfo } from '../../Components/PoolCreateInfo'
import { OracleConfigBox } from '../../Components/OracleConfigBox'
import { ChangeableConfigBox } from '../../Components/ChangeableConfigBox'

export const CreatePool = () => {
  const { ddlEngine } = useConfigs()
  const { account } = useWeb3React()
  const { pools } = useListPool()
  const [amountInit, setAmountInit] = useState<string>('')
  const [createPoolLoading, setCreatePoolLoading] = useState<boolean>(false)
  const [pairAddr, setPairAddr] = useState<string>(ZERO_ADDRESS)
  const [quoteTokenIndex, setQuoteTokenIndex] = useState<string>('0')
  const [quoteTokenDecimal, setQuoteTokenDecimal] = useState<string>('0')
  const [windowTime, setWindowTime] = useState<string>('')
  const [windowTimeSuggest, setWindowTimeSuggest] = useState<string[]>([])
  const [mark, setMark] = useState<string>('')
  const [markSuggest, setMarkSuggest] = useState<string[]>([])
  const [initTime, setInitTime] = useState<string>('')
  const [initTimeSuggest, setInitTimeSuggest] = useState<string[]>([])
  const [power, setPower] = useState<string>('')
  const [a, setA] = useState<string>('')
  const [b, setB] = useState<string>('')
  const [isValidAB, setIsValidAB] = useState<boolean>(true)
  const [dailyFundingRate, setDailyFundingRate] = useState<string>('0')
  const [recipient, setRecipient] = useState<string>(ZERO_ADDRESS)
  const { configs } = useConfigs()
  const baseTokenAddress = configs.addresses?.nativeToken
  const { balances } = useWalletBalance()
  const { tokens } = useListTokens()
  const [pairInfo, setPairInfo] = useState<string[]>([])

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
      if ((qTIndex === '0' && oracle.includes('0x0')) || (qTIndex === '1' && oracle.includes('0x8'))) {
        wTimeArr.push(bn(oracle).shr(192).toNumber().toString())
        if (parseInt(qTDecimal) === 6) {
          markArr.push(Math.pow(poolData.MARK.mul(1e6).shr(128).toNumber(), 2).toString())
        } else {
          markArr.push(Math.pow(poolData.MARK.shr(128).toNumber(), 2).toString())
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
    <div className='ddl-pool-page'>
      <Card className='ddl-pool-page__config-card'>
        <div className='ddl-pool-page__head'>
          <ButtonGrey className='ddl-pool-page__head--back-btn'>
            <IconArrowLeft />
          </ButtonGrey>
          <Text fontWeight={700} fontSize={18}>Create pool</Text>
        </div>

        <div className='ddl-pool-page__content'>
          <div className='ddl-pool-page__content--left'>
            <OracleConfigBox />
            <ChangeableConfigBox />
          </div>
          <div className='ddl-pool-page__content--right'>
            <PoolCreateInfo />
          </div>
        </div>
      </Card>
      {/* <PoolCreateInfo /> */}
    </div>
  )
}
