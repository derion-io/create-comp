import { ethers, utils } from 'ethers'
import { isAddress } from 'ethers/lib/utils'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useContract } from '../../hooks/useContract'
import { useConfigs } from '../../state/config/useConfigs'
import { useHelper } from '../../state/config/useHelper'
import { usePoolSettings } from '../../state/poolSettings/hook'
import { useListTokens } from '../../state/token/hook'
import { ZERO_ADDRESS } from '../../utils/constant'
import { div, unwrap, zerofy } from '../../utils/helpers'
import { SelectTokenModal } from '../SelectTokenModal'
import { Box } from '../ui/Box'
import { CurrencyLogo } from '../ui/CurrencyLogo'
import { SwapIcon } from '../ui/Icon'
import { Input } from '../ui/Input'
import NumberInput from '../ui/Input/InputNumber'
import { SkeletonLoader } from '../ui/SkeletonLoader'
import { Text, TextBlue, TextGrey, TextPink, TextSell } from '../ui/Text'
import './style.scss'
import { findFetcher } from '../../utils/deployHelper'
import { useWeb3React } from '../../state/customWeb3React/hook'
import jsonUniswapV2Pool from '@uniswap/v2-core/build/UniswapV2Pair.json'
import jsonUniswapV3Pool from '../../utils/abi/UniswapV3Pool.json'

export const feeOptions = [100, 300, 500, 1000]
export const OracleConfigBox = () => {
  const { poolSettings, updatePoolSettings, calculateParamsForPools } =
    usePoolSettings()
  const { ddlEngine } = useConfigs()
  // const [pairInfo, setPairInfo] = useState<string[]>([])
  const [windowTimeSuggest, setWindowTimeSuggest] = useState<string[]>([])
  // const [mark, setMark] = useState<string>('')
  // const [markSuggest, setMarkSuggest] = useState<string[]>([])
  // const [initTime, setInitTime] = useState<string>('')
  // const [initTimeSuggest, setInitTimeSuggest] = useState<string[]>([])
  const [token0, setToken0] = useState<any>({})
  const [token1, setToken1] = useState<any>({})
  const { configs } = useConfigs()
  const [fee, setFee] = useState<any>(null)
  const { tokens } = useListTokens()
  const { getTokenIconUrl } = useHelper()
  const [visibleSelectTokenModal, setVisibleSelectTokenModal] =
    useState<boolean>(false)
  const [selectingToken, setSelectingToken] = useState<
    'token0' | 'token1' | ''
  >('')
  // const { getUniV3FactoryContract } = useContract()

  // const suggestConfigs = (qTIndex: string, qTDecimal: string) => {
  //   // const filterExistPoolData = Object.entries(pools).filter(([key]) => {
  //   //   return key.includes(poolSettings.pairAddress.substring(2).toLowerCase())
  //   // })
  //   const filterExistPoolData: any = []
  //   const wTimeArr = []
  //   const markArr = []
  //   const iTimeArr = []
  //   for (let index = 0; index < filterExistPoolData.length; index++) {
  //     const poolData = filterExistPoolData[index][1]
  //     const oracle = poolData.ORACLE
  //     if (
  //       (qTIndex === '0' && oracle.includes('0x0')) ||
  //       (qTIndex === '1' && oracle.includes('0x8'))
  //     ) {
  //       wTimeArr.push(bn(oracle).shr(192).toNumber().toString())
  //       if (parseInt(qTDecimal) === 6) {
  //         markArr.push(
  //           Math.pow(poolData.MARK.mul(1e6).shr(128).toNumber(), 2).toString()
  //         )
  //       } else {
  //         markArr.push(
  //           Math.pow(poolData.MARK.shr(128).toNumber(), 2).toString()
  //         )
  //       }
  //       iTimeArr.push(poolData.INIT_TIME.toNumber().toString())
  //     }
  //   }
  //   updatePoolSettings({
  //     window: String(parseInt(wTimeArr[0]))
  //   })
  //   setWindowTimeSuggest(wTimeArr)
  //   setMark(markArr[0])
  //   setMarkSuggest(markArr)
  //   setInitTime(iTimeArr[0])
  //   setInitTimeSuggest(iTimeArr)
  // }

  // useEffect(() => {
  //   if (token0 && token1 && fee) {
  //     getPairAddress()
  //   }
  // }, [token0, token1, fee])

  useEffect(() => {
    fetchPairInfo()
  }, [poolSettings.pairAddress])

  // useEffect(() => {
  //   const [baseToken, quoteToken] = poolSettings.QTI
  //     ? [token0, token1]
  //     : [token1, token0]
  //   updatePoolSettings({
  //     quoteToken,
  //     baseToken
  //   })
  // }, [poolSettings.pairAddress, poolSettings.QTI])

  // const getPairAddress = async () => {
  //   try {
  //     const contract = getUniV3FactoryContract()
  //     const res = await contract.getPool(token0.address, token1.address, fee)
  //     if (res !== poolSettings.pairAddress) {
  //       updatePoolSettings({
  //         pairAddress: utils.getAddress(res)
  //       })
  //     }
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  const { getUniV3PairContract, getUniV2PairContract } = useContract()
  const { provider, chainId } = useWeb3React()
  const signer = provider.getSigner()
  const formatTokenType = async (token: any) => {
    return {
      address: utils.getAddress(token.address),
      decimals: token.decimals,
      symbol: token.symbol,
      name: token.name,
      logoURI: await getTokenIconUrl(utils.getAddress(token.address))
    }
  }
  const [fetchPairLoading, setFetchPairLoading] = useState(false)
  const fetchPairInfo = async () => {
    if (
      ddlEngine &&
      poolSettings.pairAddress &&
      poolSettings.pairAddress !== ZERO_ADDRESS &&
      isAddress(poolSettings.pairAddress)
    ) {
      try {
        setFetchPairLoading(true)
        console.log('#pair-start-fetch')

        // let pairContract = getUniV3PairContract(poolSettings.pairAddress)

        let pairContract = new ethers.Contract(
          poolSettings.pairAddress,
          jsonUniswapV3Pool.abi,
          provider
        )
        console.log('#pair-start-fetch2')
        let tokens
        const factory = poolSettings.factory
          ? poolSettings.factory
          : await pairContract.callStatic.factory()
        console.log('#pair-start-fetch3')
        const [FETCHER, fetcherType] = findFetcher(configs, factory)
        const exp = fetcherType?.endsWith('3') ? 2 : 1
        console.log('#pair-start-fetch4')

        if (exp === 1) {
          // pairContract = getUniV2PairContract(poolSettings.pairAddress)
          pairContract = new ethers.Contract(
            poolSettings.pairAddress,
            jsonUniswapV2Pool.abi,
            signer
          )
          tokens = await ddlEngine.UNIV2PAIR.getPairInfo({
            pairAddress: poolSettings.pairAddress
          })
        } else {
          console.log('#pair-start-fetch5')
          tokens = await ddlEngine.UNIV3PAIR.getPairInfo({
            pairAddress: poolSettings.pairAddress
          })
          console.log('#pair-start-fetch6')
          const fee = await pairContract.fee()
          console.log('#pair-start-fetch7')
          setFee(fee)
        }
        console.log('#tokenss', tokens)
        const _token0 = await formatTokenType(tokens.token0)
        const _token1 = await formatTokenType(tokens.token1)
        setToken0(_token0)
        setToken1(_token1)
        setFee(fee)
        let QTI = poolSettings.QTI
        if (QTI == null && _token0.symbol.includes('USD')) {
          QTI = 0
        }
        if (QTI == null && _token1.symbol.includes('USD')) {
          QTI = 1
        }
        if (QTI == null && configs.stablecoins.includes(_token0.address)) {
          QTI = 0
        }
        if (QTI == null && configs.stablecoins.includes(_token1.address)) {
          QTI = 1
        }
        if (QTI == null && configs.wrappedTokenAddress === _token0.address) {
          QTI = 0
        }
        if (QTI == null && configs.wrappedTokenAddress === _token1.address) {
          QTI = 1
        }
        const [baseToken, quoteToken] = QTI
          ? [_token0, _token1]
          : [_token1, _token0]
        updatePoolSettings({
          QTI,
          quoteToken,
          baseToken
          // errorMessage: ''
        })
        if (
          token0?.symbol &&
          token1?.symbol &&
          isAddress(poolSettings.pairAddress)
        ) {
          calculateParamsForPools()
        }
        setFetchPairLoading(false)
        // setPairInfo1({ pair: poolSettings.pairAddress, ...res })
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
        setFetchPairLoading(false)
        updatePoolSettings({
          quoteToken: undefined,
          baseToken: undefined,
          errorMessage: 'Invalid Pool Address'
        })
        console.log('#pair-load-error', error)
        // setPairInfo(['Can not get Pair Address Info'])
      }
    }
  }

  const { baseToken, quoteToken } = poolSettings
  const searchKeyError = useMemo(() => {
    const [s0, s1] = poolSettings.searchBySymbols
    const isDuplicatePlaceholder0 = s0 === baseToken?.symbol?.slice(1)
    const isDuplicatePlaceholder1 = s1 === baseToken?.symbol?.slice(0, -1)
    const isDuplicate = s0 !== '' && s0 === s1
    const isDuplicateBaseSymbol =
      s0 === baseToken?.symbol || s1 === baseToken?.symbol
    if (isDuplicate || isDuplicatePlaceholder0 || isDuplicatePlaceholder1) {
      return '(Duplicated)'
    }
    if (isDuplicateBaseSymbol) {
      return '(Same with base token symbol)'
    }
    return ''
  }, [baseToken?.symbol, poolSettings.searchBySymbols])
  return (
    <React.Fragment>
      <Box className='oracle-config-box mt-1 mb-2' borderColor='blue'>
        <TextBlue className='oracle-config__title'>Oracle Index</TextBlue>
        <div className='ddl-pool-page__content--pool-config'>
          <div className='config-item'>
            {/* <TextBlue fontSize={14} fontWeight={600} /> */}
            <Input
              inputWrapProps={{
                className: 'config-input-oracle-config',
                style: {
                  width: '100%'
                }
              }}
              width='100%'
              value={poolSettings.pairAddress}
              placeholder='Uniswap Pool Address (v2 or v3)'
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
          {/* <div
            className='oracle-config__token-wrap'
            // onClick={() => {
            //   setSelectingToken('token1')
            //   setVisibleSelectTokenModal(true)
            // }}
          >
            <div className='oracle-config__token'>
              {baseToken.logoURI && (
                <CurrencyLogo currencyURI={baseToken.logoURI} size={24} />
              )}
              {baseToken.symbol || 'Base Token'}
            </div>
          </div> */}
          {fetchPairLoading || !quoteToken || !baseToken ? (
            <SkeletonLoader
              height='50px'
              style={{ width: '100%' }}
              loading={fetchPairLoading}
            />
          ) : (
            quoteToken.symbol &&
            baseToken.symbol && (
              <Fragment>
                <div className='oracle-config__token-wrap'>
                  <div className='oracle-config__token'>
                    {baseToken.logoURI && (
                      <CurrencyLogo currencyURI={baseToken.logoURI} size={24} />
                    )}
                    {unwrap(baseToken.symbol)} / {unwrap(quoteToken.symbol)}
                    {quoteToken.logoURI && (
                      <CurrencyLogo
                        currencyURI={quoteToken.logoURI}
                        size={24}
                      />
                    )}
                  </div>
                </div>
                <div
                  onClick={() => {
                    updatePoolSettings({
                      QTI: poolSettings.QTI ? 0 : 1,
                      baseToken: poolSettings.quoteToken,
                      quoteToken: poolSettings.baseToken,
                      markPrice: div(1, poolSettings.markPrice)
                    })
                  }}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <SwapIcon />
                </div>
                <div className='oracle-config__price-type'>
                  <SkeletonLoader loading={poolSettings.markPrice === '0'}>
                    {zerofy(poolSettings.markPrice)}
                  </SkeletonLoader>

                  <TextGrey className='config-fee'>
                    {fee
                      ? `Uniswap V3 (${fee / 10_000}% fee)`
                      : quoteToken?.symbol && baseToken.symbol
                        ? 'Uniswap V2'
                        : ''}
                  </TextGrey>
                </div>
              </Fragment>
            )
          )}
        </div>

        <div className='mt-2 mb-1'>
          <Text fontSize={14} fontWeight={600}>
            Additional Search Keywords{' '}
            {searchKeyError.length > 0 ? (
              <TextSell>{searchKeyError}</TextSell>
            ) : (
              ''
            )}
          </Text>
        </div>
        <div className='grid-container'>
          {[0, 1].map((key, idx) => {
            return (
              <div className='config-item' key={idx}>
                <Input
                  inputWrapProps={{
                    className: `config-input ${
                      windowTimeSuggest.includes(poolSettings.window.toString())
                        ? ''
                        : 'warning-input'
                    }`
                  }}
                  value={poolSettings.searchBySymbols[key]}
                  onChange={(e) => {
                    const _searchBySymbols = poolSettings.searchBySymbols.map(
                      (p, _) => (_ === idx ? e.target.value.toUpperCase() : p)
                    )
                    updatePoolSettings({
                      searchBySymbols: _searchBySymbols
                    })
                  }}
                  placeholder={
                    (key
                      ? baseToken?.symbol?.slice(1)
                      : baseToken?.symbol?.slice(0, -1)) || 'keyword'
                  }
                />
              </div>
            )
          })}
        </div>
      </Box>

      <Box
        borderColor='blue'
        className='oracle-config-box mt-1 mb-1 grid-container'
      >
        <TextBlue className='oracle-config__title'>Configurations</TextBlue>

        <div className='config-item'>
          <Text fontSize={14} fontWeight={600}>
            TWAP Window
          </Text>
          <NumberInput
            inputWrapProps={{
              className: `config-input ${
                windowTimeSuggest.includes(poolSettings.window.toString())
                  ? ''
                  : 'warning-input'
              }`
            }}
            placeholder='0'
            value={String(poolSettings.window)}
            onValueChange={(e) => {
              // @ts-ignore
              if (Number(e.target.value) >= 0) {
                updatePoolSettings({
                  window: (e.target as HTMLInputElement).value
                })
              }
            }}
            suffix='seconds'
          />
        </div>
        <div className='config-item'>
          <div className='config-item'>
            <Text fontSize={14} fontWeight={600}>
              Leverage (compounding)
            </Text>
            <NumberInput
              inputWrapProps={{
                className: 'config-input'
              }}
              placeholder='0'
              value={String(poolSettings.power)}
              onValueChange={(e) => {
                // @ts-ignore
                if (Number(e.target.value) >= 0) {
                  updatePoolSettings({
                    power: (e.target as HTMLInputElement).value
                  })
                }
              }}
              onBlur={(e) => {
                if (Number(e.target.value) >= 0) {
                  const powerRounded =
                    Math.round(Number(e.target.value) * 2) / 2
                  updatePoolSettings({ power: String(powerRounded) })
                }
              }}
              suffix='x'
            />
          </div>
        </div>

        <div className='config-item'>
          <Text fontSize={14} fontWeight={600}>
            Interest Rate
          </Text>
          <NumberInput
            inputWrapProps={{
              className: 'config-input'
            }}
            placeholder='0'
            value={String(String(poolSettings.interestRate))}
            onValueChange={(e) => {
              // @ts-ignore
              // if (Number(e.target.value) >= 0) {
              updatePoolSettings({
                interestRate: (e.target as HTMLInputElement).value
              })
              // }
            }}
            suffix='%/day'
            // suffix={
            //   poolSettings.interestRate !== '0'
            //     ? (
            //       rateToHL(
            //         NUM(poolSettings.interestRate) / 100,
            //         NUM(poolSettings.power)
            //       ) / SECONDS_PER_DAY
            //     )
            //       .toFixed(2)
            //       .toString() + ' days'
            //     : ''
            // }
          />
        </div>

        <div className='config-item'>
          <Text fontSize={14} fontWeight={600}>
            Max Premium Rate
          </Text>
          <NumberInput
            inputWrapProps={{
              className: 'config-input'
            }}
            placeholder='0'
            value={String(poolSettings.premiumRate)}
            onValueChange={(e) => {
              // @ts-ignore
              if (Number(e.target.value) >= 0) {
                updatePoolSettings({
                  premiumRate: (e.target as HTMLInputElement).value
                })
              }
            }}
            suffix='%/day'
            // suffix={
            //   (
            //     rateToHL(
            //       poolSettings.premiumRate
            //         ? NUM(poolSettings.premiumRate) / 100
            //         : 0,
            //       NUM(poolSettings.power)
            //     ) / SECONDS_PER_DAY
            //   )
            //     .toFixed(2)
            //     .toString() + ' days'
            // }
          />
        </div>

        <div className='config-item'>
          <Text fontSize={14} fontWeight={600}>
            Opening Fee
          </Text>
          <NumberInput
            inputWrapProps={{
              className: 'config-input'
            }}
            placeholder='0'
            value={poolSettings.openingFee}
            onValueChange={(e) => {
              // @ts-ignore
              if (Number(e.target.value) >= 0) {
                updatePoolSettings({
                  openingFee: (e.target as HTMLInputElement).value
                })
              }
            }}
            suffix='%'
          />
        </div>

        <div className='config-item'>
          <Text fontSize={14} fontWeight={600}>
            Position Vesting Time
          </Text>
          <NumberInput
            inputWrapProps={{
              className: 'config-input'
            }}
            placeholder='0'
            value={String(poolSettings.vesting)}
            onValueChange={(e) => {
              // @ts-ignore
              if (Number(e.target.value) >= 0) {
                updatePoolSettings({
                  vesting: (e.target as HTMLInputElement).value
                })
              }
            }}
            suffix='seconds'
            // suffix={
            //   poolSettings.vesting
            //     ? (NUM(poolSettings.vesting) / 60).toFixed(2).toString() +
            //       ' min(s)'
            //     : ''
            // }
          />
        </div>

        <div className='config-item'>
          <Text fontSize={14} fontWeight={600}>
            Closing Fee
          </Text>
          <NumberInput
            inputWrapProps={{
              className: 'config-input'
            }}
            placeholder='0.0'
            value={String(poolSettings.closingFee)}
            onValueChange={(e) => {
              // @ts-ignore
              if (Number(e.target.value) >= 0) {
                updatePoolSettings({
                  closingFee: (e.target as HTMLInputElement).value
                })
              }
            }}
            suffix='%'
          />
        </div>

        <div className='config-item'>
          <Text fontSize={14} fontWeight={600}>
            No Closing Fee After
          </Text>
          <NumberInput
            inputWrapProps={{
              className: 'config-input'
            }}
            placeholder='0'
            value={String(poolSettings.closingFeeDuration)}
            onValueChange={(e) => {
              // @ts-ignore
              if (Number(e.target.value) >= 0) {
                updatePoolSettings({
                  closingFeeDuration: String(
                    parseFloat((e.target as HTMLInputElement).value)
                  )
                })
              }
            }}
            suffix='hours'
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
