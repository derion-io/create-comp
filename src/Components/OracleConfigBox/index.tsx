import React, { useEffect, useState } from 'react'
import { TextBlue } from '../ui/Text'
import { Input } from '../ui/Input'
import { Button, ButtonAdd, ButtonBuy } from '../ui/Button'
import { PlusIcon, SwapIcon } from '../ui/Icon'
import { useConfigs } from '../../state/config/useConfigs'
import { useListPool } from '../../state/pools/hooks/useListPool'
import { ZERO_ADDRESS } from '../../utils/constant'
import { bn } from '../../utils/helpers'
import { Box } from '../ui/Box'
import './style.scss'
import { SelectTokenModal } from '../SelectTokenModal'
import { useListTokens } from '../../state/token/hook'
import { useContract } from '../../hooks/useContract'
import { utils } from 'ethers'

export const OracleConfigBox = () => {
  const { ddlEngine } = useConfigs()
  const { pools } = useListPool()
  const [pairInfo, setPairInfo] = useState<string[]>([])
  const [quoteTokenIndex, setQuoteTokenIndex] = useState<string>('0')
  const [pairAddr, setPairAddr] = useState<string>(ZERO_ADDRESS)
  const [power, setPower] = useState<string>('')
  const [windowTimeSuggest, setWindowTimeSuggest] = useState<string[]>([])
  const [mark, setMark] = useState<string>('')
  const [markSuggest, setMarkSuggest] = useState<string[]>([])
  const [initTime, setInitTime] = useState<string>('')
  const [initTimeSuggest, setInitTimeSuggest] = useState<string[]>([])
  const [windowTime, setWindowTime] = useState<string>('')
  const [pairInfo1, setPairInfo1] = useState<any>({})
  const [token0, setToken0] = useState<any>({})
  const [token1, setToken1] = useState<any>({})
  const [fee, setFee] = useState<any>(0)
  const { tokens } = useListTokens()
  const [visibleSelectTokenModal, setVisibleSelectTokenModal] = useState<boolean>(false)
  const [selectingToken, setSelectingToken] = useState<'token0' | 'token1' | ''>('')
  const { getUniV3FactoryContract } = useContract()

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
    setWindowTime(wTimeArr[0])
    setWindowTimeSuggest(wTimeArr)
    setMark(markArr[0])
    setMarkSuggest(markArr)
    setInitTime(iTimeArr[0])
    setInitTimeSuggest(iTimeArr)
  }

  useEffect(() => {
    if (token0 && token1 && fee) {
      console.log(token0, token1, fee)
      getPairAddress()
    }
  }, [token0, token1, fee])

  useEffect(() => {
    fetchPairInfo()
  }, [pairAddr])

  const getPairAddress = async () => {
    try {
      const contract = getUniV3FactoryContract()
      const res = await contract.getPool(token0.address, token1.address, fee)
      console.log(res)
      if (res !== pairAddr) {
        setPairAddr(utils.getAddress(res))
      }
    } catch (e) {
      console.log(e)
    }
  }

  const fetchPairInfo = async () => {
    if (ddlEngine) {
      try {
        console.log('pairAddr', pairAddr)
        const res = await ddlEngine.UNIV3PAIR.getPairInfo({
          pairAddress: pairAddr
        })
        setToken0(formatTokenType(res.token0))
        setToken1(formatTokenType(res.token1))
        setFee(res.fee.toNumber)
        // setPairInfo1({ pair: pairAddr, ...res })
        // console.log(res)
        // if (res.token0.symbol.toLowerCase().includes('us') || res.token0.symbol.toLowerCase().includes('dai')) {
        //   setPairInfo([
        //     res.token1.symbol + '/' + res.token0.symbol,
        //     res.token0.symbol + '/' + res.token1.symbol
        //   ])
        //   setQuoteTokenIndex('0')
        //   suggestConfigs('0', res.token0.decimals)
        // } else {
        //   setPairInfo([
        //     res.token0.symbol + '/' + res.token1.symbol,
        //     res.token1.symbol + '/' + res.token0.symbol
        //   ])
        //   setQuoteTokenIndex('1')
        //   suggestConfigs('1', res.token1.decimals)
        // }
      } catch (error) {
        console.log(error)
        setPairInfo(['Can not get UniswapV3 Pair Info'])
      }
    }
  }

  return <React.Fragment>
    <Box
      className='oracle-config-box mt-1 mb-2'
      borderColor='blue'
    >
      <TextBlue className='oracle-config__title'>
        UniswapV3 Pair
      </TextBlue>
      <div className='ddl-pool-page__content--pool-config'>
        <div className='config-item'>
          {/* <TextBlue fontSize={14} fontWeight={600} /> */}
          <Input
            inputWrapProps={{
              className: 'config-input'
            }}
            value={pairAddr}
            placeholder='0x...'
            onChange={(e) => {
              // @ts-ignore
              setPairAddr((e.target as HTMLInputElement).value)
            }}
          />
        </div>
      </div>
      <div className='oracle-config__select-token-box'>
        <Button
          onClick={() => {
            setSelectingToken('token0')
            setVisibleSelectTokenModal(true)
          }}
        >{(quoteTokenIndex === '0' ? token0?.symbol : token1?.symbol) || 'Select token'}</Button>
        <span
          onClick={() => {
            setQuoteTokenIndex(quoteTokenIndex === '0' ? '1' : '0')
          }}
        ><SwapIcon /></span>
        <Button
          onClick={() => {
            setSelectingToken('token1')
            setVisibleSelectTokenModal(true)
          }}
        >{(quoteTokenIndex === '0' ? token1?.symbol : token0?.symbol) || 'Select token'}</Button>
      </div>
      <div className='oracle-config__select-fee-box'>
        <Button className={`btn-select-fee ${fee === 100 && 'active'}`} onClick={() => setFee(100)}>0.01%</Button>
        <Button className={`btn-select-fee ${fee === 300 && 'active'}`} onClick={() => setFee(300)}>0.03%</Button>
        <Button className={`btn-select-fee ${fee === 500 && 'active'}`} onClick={() => setFee(500)}>0.05%</Button>
        <Button className={`btn-select-fee ${fee === 1000 && 'active'}`} onClick={() => setFee(1000)}>0.1%</Button>
      </div>
    </Box>

    <Box
      borderColor='blue'
      className='oracle-config-box mt-1 mb-1'
    >
      <span className='oracle-config__title'>
      Permanent Config
      </span>

      <div>
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
      </div>
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
    </Box>
  </React.Fragment>
}

const formatTokenType = (token: any) => {
  return {
    address: utils.getAddress(token.adr),
    decimal: token.decimals,
    symbol: token.symbol,
    name: token.name
  }
}
