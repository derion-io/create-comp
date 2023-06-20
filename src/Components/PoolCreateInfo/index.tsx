import React, { useMemo, useState } from 'react'
import LeverageSlider from 'leverage-slider/dist/component'
import { bn } from '../../utils/helpers'
import './style.scss'
import { Input } from '../ui/Input'
import { SkeletonLoader } from '../ui/SkeletonLoader'
import { TokenIcon } from '../ui/TokenIcon'
import { TokenSymbol } from '../ui/TokenSymbol'
import { useListTokens } from '../../state/token/hook'
import { Text, TextBlue } from '../ui/Text'
import { useWalletBalance } from '../../state/wallet/hooks/useBalances'
import { NATIVE_ADDRESS, ZERO_ADDRESS } from '../../utils/constant'
import { formatWeiToDisplayNumber } from '../../utils/formatBalance'
import { TxFee } from '../TxFee'
import { ButtonExecute } from '../ui/Button'
import { useWeb3React } from '../../state/customWeb3React/hook'
import { useGenerateLeverageData } from '../../hooks/useGenerateLeverageData'
import { useListPool } from '../../state/pools/hooks/useListPool'
import { NoDataIcon } from '../ui/Icon'

export const PoolCreateInfo = ({ pairAddr, power }: { pairAddr: string, power: string }) => {
  const [amountIn, setAmountIn] = useState<any>()
  const [barData, setBarData] = useState<any>({ x: 0 })
  const { tokens } = useListTokens()
  const { balances } = useWalletBalance()
  const [recipient, setRecipient] = useState<string>(ZERO_ADDRESS)
  const inputTokenAddress = NATIVE_ADDRESS
  const { account } = useWeb3React()
  const { poolGroups } = useListPool()
  const data = useGenerateLeverageData(pairAddr, power, amountIn)

  useMemo(() => {
    if (account) {
      setRecipient(account)
    }
  }, [account])

  return (
    <div className='pool-create-info'>
      <div className='amount-input-box'>
        <div className='amount-input-box__head'>
          <SkeletonLoader loading={!tokens[Object.keys(tokens)[0]]}>
            <span
              className='current-token'
              onClick={(address) => {
                // setVisibleSelectTokenModal(true)
                // setTokenTypeToSelect('input')
              }}
            >
              <TokenIcon size={24} tokenAddress={inputTokenAddress} />
              <Text><TokenSymbol token={tokens[inputTokenAddress]} /></Text>
            </span>
          </SkeletonLoader>
          <SkeletonLoader loading={balances[inputTokenAddress]}>
            <Text
              className='amount-input-box__head--balance'
              onClick={() => {
                // setAmountIn(weiToNumber(balances[inputTokenAddress], tokens[inputTokenAddress]?.decimal || 18))
              }}
            >Balance: {balances && balances[inputTokenAddress]
                ? formatWeiToDisplayNumber(
                  balances[inputTokenAddress],
                  4,
                tokens[inputTokenAddress]?.decimal || 18
                )
                : 0
              }
            </Text>
          </SkeletonLoader>
        </div>
        <Input
          placeholder='0.0'
          // suffix={Number(valueIn) > 0 ? <TextGrey>${formatLocalisedCompactNumber(formatFloat(valueIn))}</TextGrey> : ''}
          className='fs-24'
          // @ts-ignore
          value={amountIn}
          onChange={(e) => {
            // @ts-ignore
            if (Number(e.target.value) >= 0) {
              setAmountIn((e.target as HTMLInputElement).value)
            }
          }}
        />
      </div>

      {
        (data && data.length > 0)
          ? <LeverageSlider
            setBarData={setBarData}
            barData={barData}
            leverageData={data}
            height={100}
          />
          : <div className='no-leverage-chart-box'>
            <NoDataIcon />
            <Text> Leverage chart here </Text>
          </div>
      }

      <div className='config-item mt-18px'>
        <div className='mb-1'>
          <TextBlue fontSize={14} fontWeight={600}>
            Recipient
          </TextBlue>
        </div>
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

      <TxFee gasUsed={bn(1000000)} />
      <ButtonExecute
        className='create-pool-button w-100'
      >
        Create pool
      </ButtonExecute>
    </div>
  )
}

const LEVERAGE_DATA = [
  {
    x: 5,
    xDisplay: '5x',
    totalSize: bn('0x4dec282667716233'),
    bars: [
      {
        x: 5,
        token: '0x767311aeb1818218E25655aeEE096982bb690013-16',
        size: 69.36,
        color: '#01A7FA',
        reserve: bn('0x360d7792eba77258')
      },
      {
        x: 5,
        token: '0x7c4a2262C23fCc45e102BD8D0fA3541Ec544e59E-16',
        size: 30.63,
        color: '#FF98E5',
        reserve: bn('0x17deb0937bc9efdb')
      }
    ]
  },
  {
    x: 9,
    xDisplay: '9x',
    totalSize: bn('0x1813e2fe4ba5869a'),
    bars: [
      {
        x: 9,
        token: '0x086D9928f862C95359C6624B74e4fEf3a9e79a74-16',
        size: 30.89,
        color: '#01A7FA',
        reserve: bn('0x1813e2fe4ba5869a')
      }
    ]
  },
  {
    x: 21,
    xDisplay: '21x',
    totalSize: bn('0x17d868afc6b2f74b'),
    bars: [
      {
        x: 21,
        token: '0x43200e62dC33C82C0e69D355480a7140eE527088-16',
        size: 30.6,
        color: '#01A7FA',
        reserve: bn('0x17d868afc6b2f74b')
      }
    ]
  },
  {
    x: 33,
    xDisplay: '33x',
    totalSize: bn('0x17a38db0b0646c82'),
    bars: [
      {
        x: 33,
        token: '0x37De2624B664e3da084F9c2177b6FCf0Fd2406de-16',
        size: 30.33,
        color: '#01A7FA',
        reserve: bn('0x17a38db0b0646c82')
      }
    ]
  }
]
