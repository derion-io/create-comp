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
    const filterExistPoolData = Object.entries(pools).filter(([key]) => {
      return key.includes(pairAddr.substring(2).toLowerCase())
    })
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
    <Card className='ddl-pool-page'>
      <div className='ddl-pool-page__header'>
        <ButtonGrey className='ddl-pool-page__header--back-btn'>
          <IconArrowLeft />
        </ButtonGrey>
        <div className='ddl-pool-page__header--name'>
          <Text fontSize={16} fontWeight={600}>
            Create Pool
          </Text>
        </div>
      </div>
      <div className='ddl-pool-page__content'>
        <div className='ddl-pool-page__content--lable mt-18px'>
          <Text fontSize={16} fontWeight={600}>
            Oracle config
          </Text>
        </div>
        <div className='ddl-pool-page__content--pool-config mt-18px'>
          <div className='config-item'>
            <TextBlue fontSize={14} fontWeight={600}>
              UniswapV3 Pair
            </TextBlue>
            <Input
              inputWrapProps={{
                className: 'config-input'
              }}
              placeholder='0x...'
              onChange={(e) => {
                // @ts-ignore
                setPairAddr((e.target as HTMLInputElement).value)
              }}
            />
            <ButtonAdd
              className='add-btn'
              onClick={async () => {
                if (ddlEngine) {
                  try {
                    const res = await ddlEngine.UNIV3PAIR.getPairInfo({
                      pairAddress: pairAddr
                    })
                    if (res.token0.symbol.toLowerCase().includes('us') || res.token0.symbol.toLowerCase().includes('dai')) {
                      setPairInfo([
                        res.token1.symbol + '/' + res.token0.symbol,
                        res.token0.symbol + '/' + res.token1.symbol
                      ])
                      setQuoteTokenIndex('0')
                      suggestConfigs('0', res.token0.decimals)
                    } else {
                      setPairInfo([
                        res.token0.symbol + '/' + res.token1.symbol,
                        res.token1.symbol + '/' + res.token0.symbol
                      ])
                      setQuoteTokenIndex('1')
                      suggestConfigs('1', res.token1.decimals)
                    }
                  } catch (error) {
                    setPairInfo(['Can not get UniswapV3 Pair Info'])
                  }
                }
              }}
            >
              <PlusIcon />
            </ButtonAdd>
          </div>
        </div>
        {pairInfo.length === 2 ? (
          <ButtonBuy
            className='switch-btn'
            onClick={async () => {
              if (ddlEngine) {
                const res = await ddlEngine.UNIV3PAIR.getPairInfo({
                  pairAddress: pairAddr
                })
                if (quoteTokenIndex === '0') {
                  setQuoteTokenIndex('1')
                  suggestConfigs('1', res.token1.decimals)
                } else {
                  setQuoteTokenIndex('0')
                  suggestConfigs('0', res.token0.decimals)
                }
              }
            }}
          >
            {
              quoteTokenIndex === '0' ? pairInfo[0] : pairInfo[1]
            }
            <SwapIcon />
          </ButtonBuy>
        ) : (
          <div className='oracle-radio text-red'>{pairInfo[0]}</div>
        )}
        <div className='ddl-pool-page__content--pool-config mt-18px'>
          <div className='config-item'>
            <TextBlue fontSize={14} fontWeight={600}>
              Window time (s)
            </TextBlue>
            <Input
              inputWrapProps={{
                className: `config-input ${windowTimeSuggest.includes(windowTime) ? '' : 'warning-input'}`
              }}
              type='number'
              placeholder='0'
              value={windowTime}
              onChange={(e) => {
                // @ts-ignore
                if (Number(e.target.value) >= 0) {
                  setWindowTime((e.target as HTMLInputElement).value)
                }
              }}
            />
          </div>
        </div>

        <div className='ddl-pool-page__content--lable mt-18px'>
          <Text fontSize={16} fontWeight={600}>
            Pool config
          </Text>
        </div>
        <div className='ddl-pool-page__content--pool-config mt-18px'>
          <div className='config-item mt-18px'>
            <TextBlue fontSize={14} fontWeight={600}>
              Mark
            </TextBlue>
            <Input
              inputWrapProps={{
                className: `config-input ${markSuggest.includes(mark) ? '' : 'warning-input'}`
              }}
              type='number'
              placeholder='0.0'
              value={mark}
              onChange={(e) => {
                // @ts-ignore
                if (Number(e.target.value) >= 0) {
                  setMark((e.target as HTMLInputElement).value)
                }
              }}
            />
          </div>
          <div className='config-item mt-18px'>
            <TextBlue fontSize={14} fontWeight={600}>
              Init time
            </TextBlue>
            <Input
              inputWrapProps={{
                className: `config-input ${initTimeSuggest.includes(initTime) ? '' : 'warning-input'}`
              }}
              type='number'
              placeholder='0'
              value={initTime}
              onChange={(e) => {
                // @ts-ignore
                if (Number(e.target.value) >= 0) {
                  setInitTime((e.target as HTMLInputElement).value)
                }
              }}
            />
          </div>
          <div className='config-item mt-18px'>
            <TextBlue fontSize={14} fontWeight={600}>
              Daily funding rate (%)
            </TextBlue>
            <Input
              inputWrapProps={{
                className: 'config-input'
              }}
              type='number'
              placeholder='0'
              onChange={(e) => {
                // @ts-ignore
                if (Number(e.target.value) >= 0) {
                  setDailyFundingRate((e.target as HTMLInputElement).value)
                }
              }}
            />
          </div>
          <div className='config-item mt-18px'>
            <TextBlue fontSize={14} fontWeight={600}>
              Recepient
            </TextBlue>
            <Input
              inputWrapProps={{
                className: 'config-input'
              }}
              value={recipient}
              placeholder='0x...'
              onChange={(e) => {
                // @ts-ignore
                setRecipient((e.target as HTMLInputElement).value)
              }}
            />
          </div>
        </div>
        <div className='ddl-pool-page__content--lable mt-18px'>
          <div className='ddl-pool-page__content--icon-and-name'>
            <TokenIcon size={24} tokenAddress={baseTokenAddress} />
            <TokenSymbol token={tokens[baseTokenAddress]} />
          </div>
          <SkeletonLoader loading={!balances[baseTokenAddress]}>
            <Text
              className='ddl-pool-page__content--balance'
              onClick={() => {
                const initValue = weiToNumber(
                  balances[baseTokenAddress],
                  tokens[baseTokenAddress]?.decimal || 18
                )
                setAmountInit(initValue)
                setA((Number(initValue) / 2.5).toString())
                setB((Number(initValue) / 2.5).toString())
              }}
            >
              Balance:{' '}
              {balances && balances[baseTokenAddress]
                ? formatWeiToDisplayNumber(
                  balances[baseTokenAddress],
                  4,
                  tokens[baseTokenAddress]?.decimal || 18
                )
                : 0}
            </Text>
          </SkeletonLoader>
        </div>
        <Input
          type='number'
          placeholder='0.0'
          className='fs-24'
          value={amountInit}
          onChange={(e) => {
            // @ts-ignore
            if (Number(e.target.value) >= 0) {
              const initValue = Number(e.target.value)
              setAmountInit(initValue.toString())
              setA((initValue / 2.5).toString())
              setB((initValue / 2.5).toString())
            }
          }}
        />
        <div className='ddl-pool-page__content--pool-config mt-18px'>
          <div className='config-item'>
            <TextBlue fontSize={14} fontWeight={600}>
              Power
            </TextBlue>
            <Input
              inputWrapProps={{
                className: 'config-input'
              }}
              type='number'
              placeholder='0.0'
              value={power}
              onChange={(e) => {
                // @ts-ignore
                if (Number(e.target.value) >= 0) {
                  setPower((e.target as HTMLInputElement).value)
                }
              }}
              onBlur={(e) => {
                if (Number(e.target.value) >= 0) {
                  const powerRounded = Math.round(Number(e.target.value) * 2) / 2
                  setPower(powerRounded.toString())
                }
              }}
            />
          </div>
          <div className='config-item mt-18px'>
            <TextBlue fontSize={14} fontWeight={600}>
              a
            </TextBlue>
            <Input
              inputWrapProps={{
                className: `config-input ${isValidAB ? '' : 'error-input'}`
              }}
              type='number'
              placeholder='0.0'
              value={a}
              onChange={(e) => {
                // @ts-ignore
                if (Number(e.target.value) >= 0) {
                  setA((e.target as HTMLInputElement).value)
                }
                // check 4ab <= R^2
                if (4 * Number(e.target.value) * Number(b) <= Math.pow(Number(amountInit), 2)) {
                  setIsValidAB(true)
                } else {
                  setIsValidAB(false)
                }
              }}
            />
          </div>
          <div className='config-item mt-18px'>
            <TextBlue fontSize={14} fontWeight={600}>
              b
            </TextBlue>
            <Input
              inputWrapProps={{
                className: `config-input ${isValidAB ? '' : 'error-input'}`
              }}
              type='number'
              placeholder='0.0'
              value={b}
              onChange={(e) => {
                // @ts-ignore
                if (Number(e.target.value) >= 0) {
                  setB((e.target as HTMLInputElement).value)
                }
                // check 4ab <= R^2
                if (4 * Number(a) * Number(e.target.value) <= Math.pow(Number(amountInit), 2)) {
                  setIsValidAB(true)
                } else {
                  setIsValidAB(false)
                }
              }}
            />
          </div>
        </div>

        <ButtonExecute
          className='create-btn mt-18px'
          disabled={!isValidAB}
          onClick={async () => {
            setCreatePoolLoading(true)
            try {
              // calculate oracle
              const oracle = ethers.utils.hexZeroPad(
                bn(quoteTokenIndex)
                  .shl(255)
                  .add(bn(windowTime).shl(256 - 64))
                  .add(pairAddr)
                  .toHexString(),
                32
              )
              const k = Number(power) * 2
              console.log(k)
              console.log(Number(dailyFundingRate) * k)
              const halfLife =
                Number(dailyFundingRate) === 0
                  ? 0
                  : Math.round(
                    SECONDS_PER_DAY /
                      Math.log2(1 / (1 - (Number(dailyFundingRate) * k) / 100))
                  )
              const params = {
                oracle,
                k,
                a: bn(numberToWei(a)),
                b: bn(numberToWei(b)),
                amountInit: bn(numberToWei(amountInit)),
                mark: parseInt(quoteTokenDecimal) === 6
                  ? bn(twoDecimal(Math.sqrt(Number(mark)))).shl(128).div(1e6)
                  : bn(twoDecimal(Math.sqrt(Number(mark)))).shl(128),
                initTime: Number(initTime),
                halfLife,
                recipient
              }
              console.log(params)
              await ddlEngine?.CREATE_POOL.createPool(params, bn(6000000))
              toast.success('Create Pool Successfully')
            } catch (error) {
              toast.error(parseCallStaticError(error))
              console.log(error)
            }
            setCreatePoolLoading(false)
          }}
        >
          {createPoolLoading ? 'Loading...' : 'Create Pool'}
        </ButtonExecute>
      </div>
    </Card>
  )
}
