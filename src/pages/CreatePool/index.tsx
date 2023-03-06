import React, { useState, useMemo } from 'react'
import './style.scss'
import 'react-tabs/style/react-tabs.css'
import { Card } from '../../Components/ui/Card'
import { IconArrowLeft, XIcon, DropDownIcon, PlusIcon } from '../../Components/ui/Icon'
import { ButtonGrey, ButtonBuy, ButtonSell, ButtonAdd, ButtonExecute } from '../../Components/ui/Button'
import { TokenIcon } from '../../Components/ui/TokenIcon'
import { TokenSymbol } from '../../Components/ui/TokenSymbol'
import { SkeletonLoader } from '../../Components/ui/SkeletonLoader'
import { Input } from '../../Components/ui/Input'
import { SelectModal } from '../../Components/SelectModal'
import { useWalletBalance } from '../../state/wallet/hooks/useBalances'
import { useListTokens } from '../../state/token/hook'
import { useNativePrice } from '../../hooks/useTokenPrice'
import { useConfigs } from '../../state/config/useConfigs'
import { Text, TextGrey, TextBlue, TextLink } from '../../Components/ui/Text'
import {
  bn,
  formatFloat,
  numberToWei,
  weiToNumber
} from '../../utils/helpers'
import { formatWeiToDisplayNumber } from '../../utils/formatBalance'

export const CreatePool = () => {
  const { data: nativePrice } = useNativePrice()
  const { ddlEngine } = useConfigs()
  const [amountInBase, setAmountInBase] = useState<string>('')
  const [amountInQuote, setAmountInQuote] = useState<string>('')
  const [visibleSelectModal, setVisibleSelectModal] = useState<boolean>(false)
  const [createPoolLoading, setCreatePoolLoading] = useState<boolean>(false)
  const [priceToleranceRatio, setPriceToleranceRatio] = useState<string>('')
  const [rentRate, setRentRate] = useState<string>('')
  const [dTokenOption, setDTokenOption] = useState<string>('Double')
  const [power, setPower] = useState<string>()
  const [dTokenPowers, setDTokenPowers] = useState<string[]>([])
  const { configs } = useConfigs()
  const baseTokenAddress = configs.addresses?.nativeToken
  const quoteTokenAddress = configs.addresses?.quoteToken
  const { balances } = useWalletBalance()
  const { tokens } = useListTokens()

  const valueInBase = useMemo(() => {
    if (Number(amountInBase) > 0) {
      if (Number(nativePrice) === 0 || !Number(nativePrice)) {
        return 0
      }
      return formatFloat(weiToNumber(bn(numberToWei(amountInBase)).mul(numberToWei(nativePrice || 0)), 36), 2)
    }
    return 0
  }, [amountInBase])

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
        <div className='ddl-pool-page__content--lable'>
          <div className='ddl-pool-page__content--icon-and-name'>
            <TokenIcon size={24} tokenAddress={baseTokenAddress} />
            <TokenSymbol token={tokens[baseTokenAddress]} />
          </div>
          <SkeletonLoader loading={!balances[baseTokenAddress]}>
            <Text
              className='ddl-pool-page__content--balance'
              onClick={() => {
                setAmountInBase(
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
          placeholder='0.0'
          suffix={valueInBase > 0 ? <TextGrey>${valueInBase}</TextGrey> : ''}
          className='fs-24'
          // @ts-ignore
          value={amountInBase}
          onChange={(e) => {
            // @ts-ignore
            if (Number(e.target.value) >= 0) {
              setAmountInBase((e.target as HTMLInputElement).value)
            }
          }}
        />

        <div className='ddl-pool-page__content--lable mt-18px'>
          <div className='ddl-pool-page__content--icon-and-name'>
            <TokenIcon size={24} tokenAddress={quoteTokenAddress} />
            <TokenSymbol token={tokens[quoteTokenAddress]} />
          </div>
          <SkeletonLoader loading={!balances[quoteTokenAddress]}>
            <Text
              className='ddl-pool-page__content--balance'
              onClick={() => {
                setAmountInQuote(
                  weiToNumber(
                    balances[quoteTokenAddress],
                    tokens[quoteTokenAddress]?.decimal || 18
                  )
                )
              }}
            >
              Balance:{' '}
              {balances && balances[quoteTokenAddress]
                ? formatWeiToDisplayNumber(
                  balances[quoteTokenAddress],
                  4,
                  tokens[quoteTokenAddress]?.decimal || 18
                )
                : 0}
            </Text>
          </SkeletonLoader>
        </div>
        <Input
          placeholder='0.0'
          suffix={Number(amountInQuote) > 0 ? <TextGrey>${amountInQuote}</TextGrey> : ''}
          className='fs-24'
          // @ts-ignore
          value={amountInQuote}
          onChange={(e) => {
            // @ts-ignore
            if (Number(e.target.value) >= 0) {
              setAmountInQuote((e.target as HTMLInputElement).value)
            }
          }}
        />

        <div className='ddl-pool-page__content--lable mt-18px'>
          <Text fontSize={16} fontWeight={600}>
            Derivative token
          </Text>
        </div>
        <div className='ddl-pool-page__content--dtoken mt-18px'>
          <div className='dtoken-group'>
            <Card className='power-select'>
              <ButtonBuy>
                <TokenSymbol token={tokens[baseTokenAddress]} />/<TokenSymbol token={tokens[quoteTokenAddress]} />
              </ButtonBuy>
              <ButtonGrey className={`sign-btn ml-05 ${dTokenOption === 'Single' ? 'hidden' : ''}`}>
                ±
              </ButtonGrey>
              <Input
                type='number'
                inputWrapProps={{
                  className: 'power-input ml-05'
                }}
                placeholder='Power'
                onChange={(e) => {
                  setPower((e.target as HTMLInputElement).value)
                }}
              />
            </Card>
          </div>
          <div className='right-group'>
            <ButtonGrey
              className='dropdown-btn'
              onClick={() => {
                setVisibleSelectModal(true)
              }}
            >
              {dTokenOption}
              <div className='dd-icon'><DropDownIcon /></div>
            </ButtonGrey>
            <ButtonAdd
              className='add-btn ml-05'
              onClick={() => {
                if (power && (Number(power) > 1 || Number(power) < -1)) {
                  const powerConverted = Number(power).toString()
                  if (dTokenOption === 'Single') {
                    if (!dTokenPowers.includes(powerConverted)) {
                      setDTokenPowers([...dTokenPowers, powerConverted])
                    }
                  } else {
                    if (Number(power) > 1) {
                      if (!dTokenPowers.includes(powerConverted) && !dTokenPowers.includes('-' + powerConverted)) {
                        setDTokenPowers([...dTokenPowers, powerConverted, '-' + powerConverted])
                      } else if (!dTokenPowers.includes(powerConverted)) {
                        setDTokenPowers([...dTokenPowers, powerConverted])
                      } else if (!dTokenPowers.includes('-' + powerConverted)) {
                        setDTokenPowers([...dTokenPowers, '-' + powerConverted])
                      }
                    } else {
                      if (!dTokenPowers.includes(powerConverted) && !dTokenPowers.includes(powerConverted.substring(1))) {
                        setDTokenPowers([...dTokenPowers, powerConverted, powerConverted.substring(1)])
                      } else if (!dTokenPowers.includes(powerConverted)) {
                        setDTokenPowers([...dTokenPowers, powerConverted])
                      } else if (!dTokenPowers.includes(powerConverted.substring(1))) {
                        setDTokenPowers([...dTokenPowers, powerConverted.substring(1)])
                      }
                    }
                  }
                }
              }}
            >
              <PlusIcon />
            </ButtonAdd>
          </div>
        </div>
        <SelectModal
          visible={visibleSelectModal}
          setVisible={setVisibleSelectModal}
          options={[
            'Double',
            'Single'
          ]}
          onSelectOption={(option: string) => {
            setDTokenOption(option)
          }}
        />
        <div className='ddl-pool-page__content--dtoken-list mt-18px'>
          {
            dTokenPowers.map((power: any, key: number) => {
              return <div className='dtoken-group' key={key}>
                <Card className='power-select'>
                  <ButtonBuy>
                    <TokenSymbol token={tokens[baseTokenAddress]} />/<TokenSymbol token={tokens[quoteTokenAddress]} />
                  </ButtonBuy>
                  <Input
                    type='number'
                    inputWrapProps={{
                      className: 'power-input ml-05'
                    }}
                    placeholder='Power'
                    value={power}
                    disabled
                  />
                </Card>
                <ButtonSell
                  className='del-btn ml-05'
                  onClick={(e) => {
                    const arr = [...dTokenPowers]
                    const idx = dTokenPowers.indexOf(power)
                    arr.splice(idx, 1)
                    setDTokenPowers(arr)
                  }}
                >
                  <XIcon />
                </ButtonSell>
              </div>
            })
          }
        </div>

        <div className='ddl-pool-page__content--lable mt-18px'>
          <Text fontSize={16} fontWeight={600}>
            Pool config
          </Text>
        </div>
        <div className='ddl-pool-page__content--pool-config mt-18px'>
          <div className='config-item'>
            <TextBlue fontSize={14} fontWeight={600}>Exposure Fee (APR) (%)</TextBlue>
            <Input
              inputWrapProps={{
                className: 'config-input'
              }}
              placeholder='0.0'
              onChange={(e) => {
                // @ts-ignore
                if (Number(e.target.value) >= 0) {
                  setRentRate((e.target as HTMLInputElement).value)
                }
              }}
            />
          </div>
          <div className='config-item mt-18px'>
            <TextBlue fontSize={14} fontWeight={600}>Price Tolence Ratio (PTR)</TextBlue>
            <Input
              inputWrapProps={{
                className: 'config-input'
              }}
              placeholder='0.0'
              onChange={(e) => {
                // @ts-ignore
                if (Number(e.target.value) >= 0) {
                  setPriceToleranceRatio((e.target as HTMLInputElement).value)
                }
              }}
            />
          </div>
        </div>

        <div className='ddl-pool-page__content--lable mt-18px'>
          <Text fontSize={16} fontWeight={600}>
            Pool info
          </Text>
        </div>
        <div className='ddl-pool-page__content--pool-info mt-18px'>
          <Card className='info-list'>
            <div className='info-item'>
              <Text fontSize={13} fontWeight={500}>Dex</Text>
              <TextLink fontSize={13} fontWeight={500}>Pancake</TextLink>
            </div>
            <div className='info-item mt-18px'>
              <Text fontSize={13} fontWeight={500}>Base Token</Text>
              <TextBlue fontSize={13} fontWeight={500}><TokenSymbol token={tokens[baseTokenAddress]} /></TextBlue>
            </div>
            <div className='info-item mt-18px'>
              <Text fontSize={13} fontWeight={500}>Quote Token</Text>
              <TextBlue fontSize={13} fontWeight={500}><TokenSymbol token={tokens[quoteTokenAddress]} /></TextBlue>
            </div>
          </Card>
        </div>

        <ButtonExecute
          className='create-btn mt-18px'
          onClick={async () => {
            setCreatePoolLoading(true)
            const deleverageRate = bn(95).shl(112).div(100)
            console.log(rentRate)
            const powers = dTokenPowers.map(Number)
            const params = {
              priceToleranceRatio,
              rentRate,
              deleverageRate,
              powers
            }
            // @ts-ignore
            await ddlEngine.CREATE_POOL.createPool(params, bn(6000000))
            setCreatePoolLoading(false)
          }}
        >
          {createPoolLoading ? 'Loading...' : 'Create Pool'}
        </ButtonExecute>
      </div>
    </Card>
  )
}
