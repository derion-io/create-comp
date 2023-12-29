import React, { useMemo, useState } from 'react'
import LeverageSlider from 'leverage-slider/dist/component'
import { bn, formatFloat, weiToNumber } from '../../utils/helpers'
import './style.scss'
import { Input } from '../ui/Input'
import { SkeletonLoader } from '../ui/SkeletonLoader'
import { TokenIcon } from '../ui/TokenIcon'
import { TokenSymbol } from '../ui/TokenSymbol'
import { useListTokens } from '../../state/token/hook'
import { Text, TextBlue } from '../ui/Text'
import { useWalletBalance } from '../../state/wallet/hooks/useBalances'
import { NATIVE_ADDRESS, ZERO_ADDRESS } from '../../utils/constant'
import formatLocalisedCompactNumber, {
  formatWeiToDisplayNumber
} from '../../utils/formatBalance'
import { TxFee } from '../TxFee'
import { ButtonExecute } from '../ui/Button'
import { useWeb3React } from '../../state/customWeb3React/hook'
import { useGenerateLeverageData } from '../../hooks/useGenerateLeverageData'
import { NoDataIcon } from '../ui/Icon'
import { Box } from '../ui/Box'
import { useTokenValue } from '../../hooks/useTokenValue'
import { deployPool } from '../../utils/deployHelper'

export const PoolCreateInfo = ({
  pairAddr,
  windowTime,
  power,
  interestRate,
  premiumRate,
  vesting,
  closingFeeDuration,
  closingFee,
  reserveToken,
  amountIn,
  setAmountIn
}: {
  pairAddr: string
  windowTime: string
  power: string
  interestRate: number
  premiumRate: number
  vesting: number
  closingFeeDuration: number
  closingFee: number
  reserveToken?: string
  amountIn: string
  setAmountIn: any
}) => {
  const { chainId, provider } = useWeb3React()
  const [barData, setBarData] = useState<any>({ x: 0 })
  const { tokens } = useListTokens()
  const { balances } = useWalletBalance()
  const [recipient, setRecipient] = useState<string>(ZERO_ADDRESS)
  const [visibleRecipient, setVisibleRecipient] = useState<boolean>(false)
  const inputTokenAddress = NATIVE_ADDRESS
  const { account } = useWeb3React()
  // const data = useGenerateLeverageData(pairAddr, power, amountIn)

  const { value } = useTokenValue({
    amount: amountIn,
    tokenAddress: NATIVE_ADDRESS
  })

  useMemo(() => {
    if (account) {
      setRecipient(account)
    }
  }, [account])

  const handleCreatePool = async () => {
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
    if (chainId && provider && account && pairAddr) {
      const signer = provider.getSigner()
      const settings = {
        pairAddress: [pairAddr],
        windowBlocks: parseInt(windowTime),
        power: parseInt(power),
        interestRate: interestRate / 100,
        premiumRate: premiumRate / 100,
        vesting: vesting,
        closingFeeDuration: closingFeeDuration * 60 * 60,
        closingFee: closingFee / 100,
        reserveToken: reserveToken,
        R: amountIn
      }
      await deployPool(settings, chainId, provider, signer)
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
              <TokenIcon size={24} tokenAddress={inputTokenAddress} />
              <Text>
                <TokenSymbol token={tokens[inputTokenAddress]} />
              </Text>
            </span>
          </SkeletonLoader>
          <SkeletonLoader loading={!balances[inputTokenAddress]}>
            <Text
              className='amount-input-box__head--balance'
              onClick={() => {
                // setAmountIn(weiToNumber(balances[inputTokenAddress], tokens[inputTokenAddress]?.decimal || 18))
              }}
            >
              Balance:{' '}
              {balances && balances[inputTokenAddress]
                ? formatWeiToDisplayNumber(
                  balances[inputTokenAddress],
                  4,
                tokens[inputTokenAddress]?.decimals || 18
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

      <Box borderColor='blue' className='estimate-box swap-info-box mt-2 mb-2'>
        <TextBlue className='estimate-box__title liquidity'>
          Liquidity {barData?.x}x
        </TextBlue>
        <InfoRow>
          <span>Value</span>
          <span className={`delta-box ${!amountIn && 'no-data'}`}>
            <div className='text-left'>
              <Text>0</Text>
            </div>
            {amountIn && (
              <React.Fragment>
                <div className='icon-plus'>
                  <Text>+</Text>
                </div>
                <div className='text-right'>
                  <Text>
                    {formatLocalisedCompactNumber(formatFloat(value))}
                  </Text>
                </div>
              </React.Fragment>
            )}
          </span>
        </InfoRow>
        <InfoRow>
          <span>Expiration</span>
          <div className={`delta-box ${!amountIn && 'no-data'}`}>
            <div className='text-left'>
              <Text>0</Text>
            </div>
            {amountIn && (
              <React.Fragment>
                <div className='plus-icon'>
                  <Text>+</Text>
                </div>
                <div className='text-right'>
                  <Text>1s</Text>
                </div>
              </React.Fragment>
            )}
          </div>
        </InfoRow>
      </Box>

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

      <TxFee gasUsed={bn(1000000)} />
      <ButtonExecute
        className='create-pool-button w-100 mt-1'
        onClick={handleCreatePool}
      >
        Create pool
      </ButtonExecute>
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
