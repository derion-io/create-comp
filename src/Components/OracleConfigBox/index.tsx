import React, { useEffect, useState } from 'react'
import { Text, TextBlue } from '../ui/Text'
import { Input } from '../ui/Input'
import { ButtonGrey } from '../ui/Button'
import { SwapIcon } from '../ui/Icon'
import { useConfigs } from '../../state/config/useConfigs'
import { SECONDS_PER_DAY, ZERO_ADDRESS } from '../../utils/constant'
import { bn } from '../../utils/helpers'
import { Box } from '../ui/Box'
import './style.scss'
import { SelectTokenModal } from '../SelectTokenModal'
import { useListTokens } from '../../state/token/hook'
import { useContract } from '../../hooks/useContract'
import { utils } from 'ethers'
import { usePoolSettings } from '../../state/poolSettings/hook'
import { rateToHL } from 'derivable-tools/dist/utils/helper'

export const OracleConfigBox = () => {
  const { poolSettings, updatePoolSettings } = usePoolSettings()
  const { ddlEngine } = useConfigs()
  const [pairInfo, setPairInfo] = useState<string[]>([])
  const [quoteTokenIndex, setQuoteTokenIndex] = useState<string>('0')
  const [windowTimeSuggest, setWindowTimeSuggest] = useState<string[]>([])
  const [mark, setMark] = useState<string>('')
  const [markSuggest, setMarkSuggest] = useState<string[]>([])
  const [initTime, setInitTime] = useState<string>('')
  const [initTimeSuggest, setInitTimeSuggest] = useState<string[]>([])
  const [token0, setToken0] = useState<any>({})
  const [token1, setToken1] = useState<any>({})
  const [fee, setFee] = useState<any>(0)
  const { tokens } = useListTokens()
  const [visibleSelectTokenModal, setVisibleSelectTokenModal] =
    useState<boolean>(false)
  const [selectingToken, setSelectingToken] = useState<
    'token0' | 'token1' | ''
  >('')
  const { getUniV3FactoryContract } = useContract()

  const suggestConfigs = (qTIndex: string, qTDecimal: string) => {
    // const filterExistPoolData = Object.entries(pools).filter(([key]) => {
    //   return key.includes(poolSettings.pairAddress.substring(2).toLowerCase())
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
    updatePoolSettings({
      window: parseInt(wTimeArr[0])
    })
    setWindowTimeSuggest(wTimeArr)
    setMark(markArr[0])
    setMarkSuggest(markArr)
    setInitTime(iTimeArr[0])
    setInitTimeSuggest(iTimeArr)
  }

  useEffect(() => {
    if (token0 && token1 && fee) {
      getPairAddress()
    }
  }, [token0, token1, fee])

  useEffect(() => {
    fetchPairInfo()
  }, [poolSettings.pairAddress])

  const getPairAddress = async () => {
    try {
      const contract = getUniV3FactoryContract()
      const res = await contract.getPool(token0.address, token1.address, fee)
      if (res !== poolSettings.pairAddress) {
        updatePoolSettings({
          pairAddress: utils.getAddress(res)
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  const { getUniV3PairContract } = useContract()

  const fetchPairInfo = async () => {
    if (
      ddlEngine &&
      poolSettings.pairAddress &&
      poolSettings.pairAddress !== ZERO_ADDRESS
    ) {
      try {
        console.log('#pairss')
        const res = await ddlEngine.UNIV3PAIR.getPairInfo({
          pairAddress: poolSettings.pairAddress
        })
        const pairContract = getUniV3PairContract(poolSettings.pairAddress)
        const fee = await pairContract.fee()
        console.log('#pair', res)
        setToken0(formatTokenType(res.token0))
        setToken1(formatTokenType(res.token1))
        setFee(fee)
      } catch (error) {
        console.log('#pair', error)
        setPairInfo(['Can not get Pair Address Info'])
      }
    }
  }

  return (
    <React.Fragment>
      <Box className='oracle-config-box mt-1 mb-2' borderColor='blue'>
        <TextBlue className='oracle-config__title'>Pair Address</TextBlue>
        <div className='ddl-pool-page__content--pool-config'>
          <div className='config-item'>
            {/* <TextBlue fontSize={14} fontWeight={600} /> */}
            <Input
              inputWrapProps={{
                className: 'config-input'
              }}
              value={poolSettings.pairAddress}
              placeholder='0x...'
              onChange={(e) => {
                // @ts-ignore
                updatePoolSettings({
                  pairAddress: (e.target as HTMLInputElement).value
                })
              }}
            />
          </div>
        </div>
        <div className='oracle-config__select-token-box'>
          <ButtonGrey
            onClick={() => {
              setSelectingToken('token0')
              setVisibleSelectTokenModal(true)
            }}
          >
            {(quoteTokenIndex === '0' ? token0?.symbol : token1?.symbol) ||
              'Select token'}
          </ButtonGrey>
          <span
            onClick={() => {
              setQuoteTokenIndex(quoteTokenIndex === '0' ? '1' : '0')
            }}
          >
            <SwapIcon />
          </span>
          <ButtonGrey
            onClick={() => {
              setSelectingToken('token1')
              setVisibleSelectTokenModal(true)
            }}
          >
            {(quoteTokenIndex === '0' ? token1?.symbol : token0?.symbol) ||
              'Select token'}
          </ButtonGrey>
        </div>
        <div className='oracle-config__select-fee-box'>
          <ButtonGrey
            className={`btn-select-fee ${fee === 100 && 'active'}`}
            onClick={() => setFee(100)}
          >
            0.01%
          </ButtonGrey>
          <ButtonGrey
            className={`btn-select-fee ${fee === 300 && 'active'}`}
            onClick={() => setFee(300)}
          >
            0.03%
          </ButtonGrey>
          <ButtonGrey
            className={`btn-select-fee ${fee === 500 && 'active'}`}
            onClick={() => setFee(500)}
          >
            0.05%
          </ButtonGrey>
          <ButtonGrey
            className={`btn-select-fee ${fee === 1000 && 'active'}`}
            onClick={() => setFee(1000)}
          >
            0.1%
          </ButtonGrey>
        </div>
      </Box>

      <Box
        borderColor='blue'
        className='oracle-config-box mt-1 mb-1 grid-container'
      >
        <div className='config-item'>
          <Text fontSize={14} fontWeight={600}>
            Window time (s)
          </Text>
          <Input
            inputWrapProps={{
              className: `config-input ${
                windowTimeSuggest.includes(poolSettings.window.toString())
                  ? ''
                  : 'warning-input'
              }`
            }}
            type='number'
            placeholder='0'
            value={poolSettings.window}
            onChange={(e) => {
              // @ts-ignore
              if (Number(e.target.value) >= 0) {
                updatePoolSettings({
                  window: parseFloat((e.target as HTMLInputElement).value)
                })
              }
            }}
          />
        </div>
        <div className='config-item'>
          <div className='config-item'>
            <Text fontSize={14} fontWeight={600}>
              Power
            </Text>
            <Input
              inputWrapProps={{
                className: 'config-input'
              }}
              type='number'
              placeholder='0.0'
              value={poolSettings.power}
              onChange={(e) => {
                // @ts-ignore
                if (Number(e.target.value) >= 0) {
                  updatePoolSettings({
                    power: parseFloat((e.target as HTMLInputElement).value)
                  })
                }
              }}
              onBlur={(e) => {
                if (Number(e.target.value) >= 0) {
                  const powerRounded =
                    Math.round(Number(e.target.value) * 2) / 2
                  updatePoolSettings({ power: powerRounded })
                }
              }}
            />
          </div>
        </div>

        <div className='config-item'>
          <Text fontSize={14} fontWeight={600}>
            Interest Rate (%)
          </Text>
          <Input
            inputWrapProps={{
              className: 'config-input'
            }}
            type='number'
            placeholder='0'
            value={poolSettings.interestRate}
            onChange={(e) => {
              // @ts-ignore
              if (Number(e.target.value) >= 0) {
                updatePoolSettings({
                  interestRate: parseFloat((e.target as HTMLInputElement).value)
                })
              }
            }}
            suffix={
              poolSettings.interestRate !== 0
                ? (
                    rateToHL(
                      poolSettings.interestRate / 100,
                      poolSettings.power
                    ) / SECONDS_PER_DAY
                  )
                    .toFixed(2)
                    .toString() + ' days'
                : ''
            }
          />
        </div>

        <div className='config-item'>
          <Text fontSize={14} fontWeight={600}>
            Closing fee (%)
          </Text>
          <Input
            inputWrapProps={{
              className: 'config-input'
            }}
            type='number'
            placeholder='0'
            value={poolSettings.closingFee}
            onChange={(e) => {
              // @ts-ignore
              if (Number(e.target.value) >= 0) {
                updatePoolSettings({
                  closingFee: parseFloat((e.target as HTMLInputElement).value)
                })
              }
            }}
          />
        </div>

        <div className='config-item'>
          <Text fontSize={14} fontWeight={600}>
            Maturity (h)
          </Text>
          <Input
            inputWrapProps={{
              className: 'config-input'
            }}
            type='number'
            placeholder='0'
            value={poolSettings.closingFeeDuration}
            onChange={(e) => {
              // @ts-ignore
              if (Number(e.target.value) >= 0) {
                updatePoolSettings({
                  closingFeeDuration: parseFloat(
                    (e.target as HTMLInputElement).value
                  )
                })
              }
            }}
          />
        </div>

        <div className='config-item'>
          <Text fontSize={14} fontWeight={600}>
            Vesting Period (s)
          </Text>
          <Input
            inputWrapProps={{
              className: 'config-input'
            }}
            type='number'
            placeholder='0'
            value={poolSettings.vesting}
            onChange={(e) => {
              // @ts-ignore
              if (Number(e.target.value) >= 0) {
                updatePoolSettings({
                  vesting: parseFloat((e.target as HTMLInputElement).value)
                })
              }
            }}
            suffix={
              poolSettings.vesting
                ? (poolSettings.vesting / 60).toFixed(2).toString() + ' min(s)'
                : ''
            }
          />
        </div>

        <div className='config-item'>
          <Text fontSize={14} fontWeight={600}>
            Premium Rate (%)
          </Text>
          <Input
            inputWrapProps={{
              className: 'config-input'
            }}
            type='number'
            placeholder='0'
            value={poolSettings.premiumRate}
            onChange={(e) => {
              // @ts-ignore
              if (Number(e.target.value) >= 0) {
                updatePoolSettings({
                  premiumRate: parseFloat((e.target as HTMLInputElement).value)
                })
              }
            }}
            suffix={
              (
                rateToHL(
                  poolSettings.premiumRate ? poolSettings.premiumRate / 100 : 0,
                  poolSettings.power
                ) / SECONDS_PER_DAY
              )
                .toFixed(2)
                .toString() + ' days'
            }
          />
        </div>
      </Box>
      <SelectTokenModal
        visible={visibleSelectTokenModal}
        setVisible={setVisibleSelectTokenModal}
        iniTokens={Object.values(tokens)}
        onSelectToken={(token: any) => {
          console.log(selectingToken)
          if (selectingToken === 'token0') {
            setToken0(token)
          } else {
            setToken1(token)
          }
        }}
      />
    </React.Fragment>
  )
}

const formatTokenType = (token: any) => {
  return {
    address: utils.getAddress(token.adr),
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name
  }
}
