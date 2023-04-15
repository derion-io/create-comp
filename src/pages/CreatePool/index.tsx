import React, { useState, useMemo } from 'react'
import { ethers } from 'ethers'
import './style.scss'
import 'react-tabs/style/react-tabs.css'
import { ZERO_ADDRESS, SECONDS_PER_DAY } from '../../utils/constant'
import { Card } from '../../Components/ui/Card'
import { IconArrowLeft, PlusIcon } from '../../Components/ui/Icon'
import {
  ButtonGrey,
  ButtonExecute,
  ButtonAdd
} from '../../Components/ui/Button'
import { TokenIcon } from '../../Components/ui/TokenIcon'
import { TokenSymbol } from '../../Components/ui/TokenSymbol'
import { SkeletonLoader } from '../../Components/ui/SkeletonLoader'
import { Input } from '../../Components/ui/Input'
import { useWeb3React } from '../../state/customWeb3React/hook'
import { useWalletBalance } from '../../state/wallet/hooks/useBalances'
import { useListTokens } from '../../state/token/hook'
import { useConfigs } from '../../state/config/useConfigs'
import { Text, TextBlue } from '../../Components/ui/Text'
import { bn, numberToWei, weiToNumber } from '../../utils/helpers'
import { formatWeiToDisplayNumber } from '../../utils/formatBalance'

export const CreatePool = () => {
  const { ddlEngine } = useConfigs()
  const { account } = useWeb3React()
  const [amountInit, setAmountInit] = useState<string>('')
  const [createPoolLoading, setCreatePoolLoading] = useState<boolean>(false)
  const [pairAddr, setPairAddr] = useState<string>(ZERO_ADDRESS)
  const [quoteTokenIndex, setQuoteTokenIndex] = useState<string>('0')
  const [windowTime, setWindowTime] = useState<string>('0')
  const [power, setPower] = useState<string>('0')
  const [mark, setMark] = useState<string>('0')
  const [a, setA] = useState<string>('0')
  const [b, setB] = useState<string>('0')
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
                    setPairInfo([
                      res.token0.symbol + '/' + res.token1.symbol,
                      res.token1.symbol + '/' + res.token0.symbol
                    ])
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
          <div
            className='oracle-radio'
            onChange={(e) =>
              setQuoteTokenIndex((e.target as HTMLInputElement).value)
            }
          >
            <input type='radio' value='1' name='gender' /> {pairInfo[0]}
            <input type='radio' value='0' name='gender' /> {pairInfo[1]}
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
                className: 'config-input'
              }}
              type='number'
              placeholder='0'
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
        <div className='ddl-pool-page__content--lable'>
          <div className='ddl-pool-page__content--icon-and-name'>
            <TokenIcon size={24} tokenAddress={baseTokenAddress} />
            <TokenSymbol token={tokens[baseTokenAddress]} />
          </div>
          <SkeletonLoader loading={!balances[baseTokenAddress]}>
            <Text
              className='ddl-pool-page__content--balance'
              onClick={() => {
                setAmountInit(
                  weiToNumber(
                    balances[baseTokenAddress],
                    tokens[baseTokenAddress]?.decimal || 18
                  )
                )
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
          onChange={(e) => {
            // @ts-ignore
            if (Number(e.target.value) >= 0) {
              setAmountInit((e.target as HTMLInputElement).value)
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
              onChange={(e) => {
                // @ts-ignore
                if (Number(e.target.value) >= 0) {
                  setPower((e.target as HTMLInputElement).value)
                }
              }}
            />
          </div>
          <div className='config-item mt-18px'>
            <TextBlue fontSize={14} fontWeight={600}>
              Initialization of long
            </TextBlue>
            <Input
              inputWrapProps={{
                className: 'config-input'
              }}
              type='number'
              placeholder='0.0'
              onChange={(e) => {
                // @ts-ignore
                if (Number(e.target.value) >= 0) {
                  setA((e.target as HTMLInputElement).value)
                }
              }}
            />
          </div>
          <div className='config-item mt-18px'>
            <TextBlue fontSize={14} fontWeight={600}>
              Initialization of short
            </TextBlue>
            <Input
              inputWrapProps={{
                className: 'config-input'
              }}
              type='number'
              placeholder='0.0'
              onChange={(e) => {
                // @ts-ignore
                if (Number(e.target.value) >= 0) {
                  setB((e.target as HTMLInputElement).value)
                }
              }}
            />
          </div>
          <div className='config-item mt-18px'>
            <TextBlue fontSize={14} fontWeight={600}>
              Mark
            </TextBlue>
            <Input
              inputWrapProps={{
                className: 'config-input'
              }}
              type='number'
              placeholder='0.0'
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

        <ButtonExecute
          className='create-btn mt-18px'
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
              const halfLife =
                Number(dailyFundingRate) === 0
                  ? 0
                  : Math.round(
                    SECONDS_PER_DAY /
                      Math.log2(1 / (1 - Number(dailyFundingRate) / 100))
                  )
              const params = {
                oracle,
                k,
                a: bn(numberToWei(a)),
                b: bn(numberToWei(b)),
                amountInit: bn(numberToWei(amountInit)),
                mark: bn(Number(mark)).shl(112),
                halfLife,
                recipient
              }
              console.log(params)
              // // @ts-ignore
              await ddlEngine?.CREATE_POOL.createPool(params, bn(6000000))
            } catch (error) {
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
