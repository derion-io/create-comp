import React, { useState, useMemo } from 'react'
import { ethers, providers } from 'ethers'
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
import {
  bn,
  numberToWei,
  weiToNumber,
  parseCallStaticError
} from '../../utils/helpers'
import { formatWeiToDisplayNumber } from '../../utils/formatBalance'
import { toast } from 'react-toastify'

const ArrowDown = () => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M16.2071 9.79289C15.8166 9.40237 15.1834 9.40237 14.7929 9.79289L12 12.5858L9.20711 9.79289C8.81658 9.40237 8.18342 9.40237 7.79289 9.79289C7.40237 10.1834 7.40237 10.8166 7.79289 11.2071L11.2929 14.7071C11.6834 15.0976 12.3166 15.0976 12.7071 14.7071L16.2071 11.2071C16.5976 10.8166 16.5976 10.1834 16.2071 9.79289Z'
        fill='white'
      />
    </svg>
  )
}

const Rectangle = () => {
  return (
    <svg
      width='23'
      height='24'
      viewBox='0 0 23 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect width='23' height='24' rx='4' fill='#242731' />
      <path
        d='M8.804 16V15.052H14.18V16H8.804ZM10.988 13.78V8.656H11.996V13.78H10.988ZM8.804 11.692V10.744H14.18V11.692H8.804Z'
        fill='white'
      />
    </svg>
  )
}

const DeclineButton = () => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect
        x='24'
        y='24'
        width='24'
        height='24'
        rx='8'
        transform='rotate(-180 24 24)'
        fill='#FF7A68'
        fill-opacity='0.46'
      />
      <path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M16.4714 16.4714C16.2111 16.7317 15.7889 16.7317 15.5286 16.4714L12 12.9428L8.4714 16.4714C8.21105 16.7317 7.78894 16.7317 7.52859 16.4714C7.26824 16.211 7.26824 15.7889 7.52859 15.5286L11.0572 12L7.52859 8.47136C7.26824 8.21101 7.26824 7.7889 7.52859 7.52855C7.78894 7.2682 8.21105 7.2682 8.4714 7.52855L12 11.0572L15.5286 7.52855C15.7889 7.2682 16.2111 7.2682 16.4714 7.52855C16.7318 7.7889 16.7318 8.21101 16.4714 8.47136L12.9428 12L16.4714 15.5286C16.7318 15.7889 16.7318 16.211 16.4714 16.4714Z'
        fill='#FF7A68'
      />
    </svg>
  )
}
export const CreatePool = () => {
  const { ddlEngine } = useConfigs()
  const { library, account } = useWeb3React()
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

  const getCurrentBlockTimestamp = async (library: any) => {
    const blockNumber = await library.getBlockNumber()
    const block = await library.getBlock(blockNumber)
    return block.timestamp
  }

  const suggestConfigs = async (qTIndex: string, qTDecimal: string) => {
    const filterExistPoolData = Object.entries(pools).filter(([key]) => {
      return key.includes(pairAddr.substring(2).toLowerCase())
    })
    const wTimeArr = []
    const markArr = []
    const iTimeArr = []
    const powerArr = []
    const dlFundingArr = []
    if (filterExistPoolData.length > 0) {
      for (let index = 0; index < filterExistPoolData.length; index++) {
        const poolData = filterExistPoolData[index][1]
        const oracle = poolData.ORACLE
        console.log(poolData, oracle)
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
    } else {
      wTimeArr.push(bn(60).toNumber().toString())
      // markArr.push()
      const timestamp = await getCurrentBlockTimestamp(library)
      console.log(timestamp)
      iTimeArr.push(bn(timestamp).toNumber().toString())
      powerArr.push(bn(2).toNumber().toString())
      dlFundingArr.push((Math.abs(2 * 2) * 0.03).toString())
      console.log(dlFundingArr[0])
    }
    setQuoteTokenDecimal(qTDecimal)
    setWindowTime(wTimeArr[0])
    setWindowTimeSuggest(wTimeArr)
    setMark(markArr[0])
    setMarkSuggest(markArr)
    setInitTime(iTimeArr[0])
    setInitTimeSuggest(iTimeArr)
    setPower(powerArr[0])
    setDailyFundingRate(dlFundingArr[0])
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
          <div className='ddl-pool-page__content--icon-and-name'>
            <TokenIcon size={24} tokenAddress={baseTokenAddress} />
            <TokenSymbol token={tokens[baseTokenAddress]} />
            <ArrowDown />
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
          isBigsize='true'
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
      </div>
      <div className='ddl-pool-page__content'>
        {/* <div
          className='ddl-pool-page__content--icon-and-name'
          style={{ marginBottom: '16px' }}
        >
          <TokenIcon size={24} tokenAddress={baseTokenAddress} />
          <Text fontSize={16} fontWeight={600}>
            Derivative token
          </Text>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '9px',
              // justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                border: '1px solid #353945',
                borderRadius: '8px',
                padding: '8px',
                maxWidth: '188px',
                display: 'flex',
                gap: '4px'
              }}
            >
              <div
                style={{
                  minWidth: '88px',
                  height: '40px',
                  backgroundColor: '#4FBF67',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <Text fontSize={14} fontWeight={600}>
                  ETH/USDT
                </Text>
              </div>
              <Rectangle />
              <div
                style={{
                  backgroundColor: '#242731',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  maxHeight: '24px',
                  minWidth: '53px'
                }}
              >
                <Text fontSize={12} fontWeight={500}>
                  Power
                </Text>
              </div>
            </div>
            <DeclineButton />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                minHeight: '40px',
                maxWidth: '86px',
                padding: '12px',
                border: '1px solid #01A7FA',
                backgroundColor: '#242731',
                borderRadius: '12px'
              }}
            >
              <Text fontSize={13} fontWeight={500}>
                Long
              </Text>
              <ArrowDown />
            </div>
            <ButtonAdd className='add-btn'>
              <PlusIcon />
            </ButtonAdd>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              gap: '9px',
              // justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                border: '1px solid #353945',
                borderRadius: '8px',
                padding: '8px',
                maxWidth: '188px',
                display: 'flex',
                gap: '4px'
              }}
            >
              <div
                style={{
                  minWidth: '88px',
                  height: '40px',
                  backgroundColor: '#4FBF67',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <Text fontSize={14} fontWeight={600}>
                  ETH/USDT
                </Text>
              </div>
              <div
                style={{
                  backgroundColor: '#242731',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  maxHeight: '24px',
                  minWidth: '53px'
                }}
              >
                <Text fontSize={12} fontWeight={500}>
                  Power
                </Text>
              </div>
            </div>
            <DeclineButton />
          </div>
        </div> */}
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
                    console.log(res)
                    if (
                      res.token0.symbol.toLowerCase().includes('us') ||
                      res.token0.symbol.toLowerCase().includes('dai')
                    ) {
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <ButtonBuy
              className={`switch-btn ${
                quoteTokenIndex === '1' && 'disable-btn'
              }`}
              onClick={async () => {
                if (ddlEngine) {
                  const res = await ddlEngine.UNIV3PAIR.getPairInfo({
                    pairAddress: pairAddr
                  })
                  setQuoteTokenIndex('0')
                  suggestConfigs('0', res.token0.decimals)
                }
              }}
            >
              {pairInfo[0]}
            </ButtonBuy>
            <ButtonBuy
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '10px'
              }}
              className={`${quoteTokenIndex === '0' && 'disable-btn'}`}
              onClick={async () => {
                if (ddlEngine) {
                  const res = await ddlEngine.UNIV3PAIR.getPairInfo({
                    pairAddress: pairAddr
                  })
                  setQuoteTokenIndex('1')
                  suggestConfigs('1', res.token1.decimals)
                }
              }}
            >
              {pairInfo[1]}
            </ButtonBuy>
          </div>
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
                className: `config-input ${
                  windowTimeSuggest.includes(windowTime) ? '' : 'active-input'
                }`
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
                className: `config-input ${
                  markSuggest.includes(mark) ? '' : 'active-input'
                }`
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
                className: `config-input ${
                  initTimeSuggest.includes(initTime) ? '' : 'active-input'
                }`
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
              value={dailyFundingRate}
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
                  const powerRounded =
                    Math.round(Number(e.target.value) * 2) / 2
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
                if (
                  4 * Number(e.target.value) * Number(b) <=
                  Math.pow(Number(amountInit), 2)
                ) {
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
                if (
                  4 * Number(a) * Number(e.target.value) <=
                  Math.pow(Number(amountInit), 2)
                ) {
                  setIsValidAB(true)
                } else {
                  setIsValidAB(false)
                }
              }}
            />
          </div>
          <div className='ddl-pool-page__content--lable mt-18px'>
            <Text fontSize={16} fontWeight={600}>
              Pool Info
            </Text>
          </div>
          {/* <div className='ddl-pool-page__content--pool-config mt-18px'>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '24px',
                gap: '16px',
                border: '1px solid #353945',
                borderRadius: '12px'
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'start'
                }}
              >
                <Text fontSize={13} fontWeight={500}>
                  Dex
                </Text>
                <div>
                  <p
                    style={{
                      color: '#FF98E5',
                      fontSize: '14px',
                      fontWeight: 400
                    }}
                  >
                    Pancake
                  </p>
                </div>
              </div>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'start'
                }}
              >
                <Text fontSize={13} fontWeight={500}>
                  Base Token
                </Text>
                <div>
                  <p
                    style={{
                      color: '#01A7FA',
                      fontSize: '14px',
                      fontWeight: 700
                    }}
                  >
                    ETH
                  </p>
                </div>
              </div>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'start'
                }}
              >
                <Text fontSize={13} fontWeight={500}>
                  Quote Token
                </Text>
                <div>
                  <p
                    style={{
                      color: '#01A7FA',
                      fontSize: '14px',
                      fontWeight: 700
                    }}
                  >
                    USDT
                  </p>
                </div>
              </div>
            </div>
          </div> */}
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
                        Math.log2(
                          1 / (1 - (Number(dailyFundingRate) * k) / 100)
                        )
                    )
              const params = {
                oracle,
                k,
                a: bn(numberToWei(a)),
                b: bn(numberToWei(b)),
                amountInit: bn(numberToWei(amountInit)),
                mark:
                  parseInt(quoteTokenDecimal) === 6
                    ? bn(twoDecimal(Math.sqrt(Number(mark))))
                        .shl(128)
                        .div(1e6)
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
