import LeverageSlider from 'leverage-slider/dist/component'
import React, { useEffect, useMemo, useState } from 'react'
import { useGenerateLeverageData } from '../../hooks/useGenerateLeverageData'
import { useTokenValue } from '../../hooks/useTokenValue'
import { useConfigs } from '../../state/config/useConfigs'
import { useWeb3React } from '../../state/customWeb3React/hook'
import { usePoolSettings } from '../../state/poolSettings/hook'
import { useListPool } from '../../state/pools/hooks/useListPool'
import { useListTokens } from '../../state/token/hook'
import { useWalletBalance } from '../../state/wallet/hooks/useBalances'
import { NATIVE_ADDRESS, ZERO_ADDRESS } from '../../utils/constant'
import formatLocalisedCompactNumber, {
  formatWeiToDisplayNumber
} from '../../utils/formatBalance'
import {
  bn,
  formatFloat,
  numDec,
  numInt,
  weiToNumber
} from '../../utils/helpers'
import { TxFee } from '../TxFee'
import { Box } from '../ui/Box'
import { ButtonExecute } from '../ui/Button'
import { NoDataIcon } from '../ui/Icon'
import { Input } from '../ui/Input'
import { SkeletonLoader } from '../ui/SkeletonLoader'
import { Text, TextBlue, TextGrey, TextPink } from '../ui/Text'
import { TokenIcon } from '../ui/TokenIcon'
import { TokenSymbol } from '../ui/TokenSymbol'
import './style.scss'
function numSplit(v: string) {
  return (
    <div>
      <span className='position-delta--right'>{numInt(v)}</span>
      <span className='position-delta--left'>{numDec(v)}</span>
    </div>
  )
}
export const PoolCreateInfo = () => {
  const {
    poolSettings,
    updatePoolSettings,
    deployPool,
    calculateParamsForPools
  } = usePoolSettings()
  useEffect(() => {
    console.log('#poolSettings', poolSettings)
  }, [poolSettings])
  const { chainId, provider } = useWeb3React()
  const [barData, setBarData] = useState<any>({})
  const { tokens } = useListTokens()
  const { balances } = useWalletBalance()
  const [recipient, setRecipient] = useState<string>(ZERO_ADDRESS)
  const [visibleRecipient, setVisibleRecipient] = useState<boolean>(false)
  const { account } = useWeb3React()
  const { pools } = useListPool()

  const { configs } = useConfigs()
  const wrappedTokenAddress = configs.wrappedTokenAddress
  const data = useGenerateLeverageData(
    poolSettings.pairAddress,
    poolSettings.power.toString(),
    poolSettings.amountIn.toString()
  )
  const { value } = useTokenValue({
    amount: poolSettings.amountIn.toString(),
    tokenAddress:
      poolSettings.reserveToken || NATIVE_ADDRESS || wrappedTokenAddress
    // NATIVE_ADDRESS
  })

  useMemo(() => {
    console.log('#data', data)
    console.log('#barData', barData)
  }, [data, barData])
  useEffect(() => {
    if (Object.values(pools).length > 0) {
      for (let i = 0; i < data.length; i++) {
        const leve: any = data[i]
        for (let k = 0; k < leve.bars.length; k++) {
          console.log('#leve-bar', leve.bars[k])
          setBarData(leve.bars[k])
        }
      }
    }
  }, [pools])

  useMemo(() => {
    if (account) {
      setRecipient(account)
    }
  }, [account])

  useEffect(() => {
    const handlePoolChange = setTimeout(() => {
      if (chainId && provider && poolSettings.pairAddress) {
        const signer = provider.getSigner()
        calculateParamsForPools(chainId, provider, signer)
      }
    }, 1000)
    return () => {
      clearTimeout(handlePoolChange)
    }
  }, [poolSettings])

  const handleCreatePool = async () => {
    const pairAddress = poolSettings.pairAddress
    // const settings = {
    //   // pairAddress: '0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443',
    //   // pairAddress: '0x8d76e9c2bd1adde00a3dcdc315fcb2774cb3d1d6',
    //   pairAddress: ['0x31C77F72BCc209AD00E3B7be13d719c08cb7BA7B'],
    //   windowBlocks: 120,
    //   power: 2,
    //   interestRate: 0.03 / 100,
    //   premiumRate: 0.3 / 100,
    //   vesting: 60,
    //   closingFee: 0.3 / 100,
    //   closingFeeDuration: 24 * 60 * 60,
    //   reserveToken: 'PLD' // PlayDerivable
    //   // openingFee: 0/100,
    //   // R: 0.0001, // init liquidity
    // }
    console.log('#deplyer', chainId, provider, pairAddress)
    if (chainId && provider && pairAddress) {
      const signer = provider.getSigner()
      await deployPool(chainId, provider, signer)
    }
  }

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
              <TokenIcon size={24} tokenAddress={poolSettings.reserveToken} />
              <Text>
                <TokenSymbol token={tokens[poolSettings.reserveToken]} />
              </Text>
            </span>
          </SkeletonLoader>
          <SkeletonLoader loading={!balances[poolSettings.reserveToken]}>
            <Text
              className='amount-input-box__head--balance'
              onClick={() => {
                updatePoolSettings({
                  amountIn: weiToNumber(
                    balances[poolSettings.reserveToken],
                    tokens[poolSettings.reserveToken]?.decimals || 18
                  )
                })
              }}
            >
              Balance:{' '}
              {balances && balances[poolSettings.reserveToken]
                ? formatWeiToDisplayNumber(
                    balances[poolSettings.reserveToken],
                    4,
                    tokens[poolSettings.reserveToken]?.decimals || 18
                  )
                : 0}
            </Text>
          </SkeletonLoader>
        </div>
        <Input
          placeholder='0.0'
          // suffix={Number(valueIn) > 0 ? <TextGrey>${formatLocalisedCompactNumber(formatFloat(valueIn))}</TextGrey> : ''}
          className='fs-24'
          // @ts-ignore
          value={poolSettings.amountIn}
          onChange={(e) => {
            // @ts-ignore
            if (Number(e.target.value) >= 0) {
              updatePoolSettings({
                amountIn: (e.target as HTMLInputElement).value
              })
            }
          }}
          suffix={
            Number(value) > 0 ? (
              <TextGrey>
                ${formatLocalisedCompactNumber(formatFloat(value))}
              </TextGrey>
            ) : (
              ''
            )
          }
        />
      </div>

      <Box borderColor='blue' className='estimate-box swap-info-box mt-2 mb-2'>
        <TextBlue className='estimate-box__title liquidity'>
          Liquidity {poolSettings.power}x
        </TextBlue>
        <InfoRow>
          <TextGrey>Balance</TextGrey>
          <span className={`delta-box ${!poolSettings.amountIn && 'no-data'}`}>
            <div className='text-left' />
            {poolSettings.amountIn && (
              <div className='text-right'>
                {value && parseFloat(poolSettings.amountIn.toString()) > 0 ? (
                  <Text>
                    {numSplit(
                      formatLocalisedCompactNumber(
                        formatFloat(poolSettings.amountIn)
                      )
                    )}
                    {/* <Text>
                      <TokenSymbol token={tokens[poolSettings.reserveToken]} />
                    </Text> */}
                    {/* {' ($'} */}
                    {/* {formatLocalisedCompactNumber(formatFloat(value)) + ')'} */}
                  </Text>
                ) : (
                  ''
                )}
              </div>
            )}
          </span>
        </InfoRow>
        <InfoRow>
          <TextGrey>Value</TextGrey>
          <span className={`delta-box ${!poolSettings.amountIn && 'no-data'}`}>
            <div className='text-left' />
            {poolSettings.amountIn && (
              <div className='text-right'>
                {value && parseFloat(poolSettings.amountIn.toString()) > 0 ? (
                  <Text>
                    {/* {numSplit(
                      formatLocalisedCompactNumber(
                        formatFloat(poolSettings.amountIn)
                      )
                    )} */}
                    {/* <Text>
                      <TokenSymbol token={tokens[poolSettings.reserveToken]} />
                    </Text> */}
                    {numSplit(
                      '$' + formatLocalisedCompactNumber(formatFloat(value, 2))
                    )}
                  </Text>
                ) : (
                  ''
                )}
              </div>
            )}
          </span>
        </InfoRow>

        <InfoRow>
          <TextGrey>Expiration</TextGrey>
          <div className={`delta-box ${!poolSettings.amountIn && 'no-data'}`}>
            <div className='text-left' />
            {poolSettings.amountIn && (
              <div className='text-right'>
                <Text>
                  {poolSettings.closingFeeDuration}{' '}
                  <span className='position-delta--left'>hr(s)</span>
                </Text>
              </div>
            )}
          </div>
        </InfoRow>

        <InfoRow>
          <TextGrey>Mark Price</TextGrey>
          <div className={`delta-box ${!poolSettings.amountIn && 'no-data'}`}>
            <div className='text-right'>
              <SkeletonLoader loading={poolSettings.markPrice === '0'}>
                <Text>{numSplit('$' + String(poolSettings.markPrice))}</Text>
              </SkeletonLoader>
            </div>
          </div>
        </InfoRow>
      </Box>

      {data && data.length > 0 && Object.keys(barData).length > 0 ? (
        <LeverageSlider
          setBarData={setBarData}
          barData={barData}
          leverageData={data}
          height={100}
        />
      ) : (
        <div className='no-leverage-chart-box'>
          <NoDataIcon />
          <Text> Leverage chart here </Text>
        </div>
      )}

      <div className='config-item mt-2 mb-1'>
        <div className='recipient-box'>
          <TextBlue fontSize={14} fontWeight={600}>
            Recipient
          </TextBlue>
          <TextBlue
            className='btn-toggle'
            fontSize={14}
            fontWeight={600}
            onClick={() => {
              setVisibleRecipient(!visibleRecipient)
            }}
          >
            {visibleRecipient ? '-' : '+'}
          </TextBlue>
        </div>
        {visibleRecipient && (
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
        )}
      </div>

      <TxFee gasUsed={bn(poolSettings.gasUsed)} />
      <ButtonExecute
        className='create-pool-button w-100 mt-1'
        onClick={handleCreatePool}
      >
        Create pool
      </ButtonExecute>
      <TextPink>{poolSettings.errorMessage}</TextPink>
    </div>
  )
}

const InfoRow = (props: any) => {
  return (
    <div
      className={
        'd-flex jc-space-between info-row font-size-12 ' + props.className
      }
    >
      {props.children}
    </div>
  )
}
