import { utils } from 'ethers'
import { isAddress } from 'ethers/lib/utils'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useContract } from '../../hooks/useContract'
import { useConfigs } from '../../state/config/useConfigs'
import { useHelper } from '../../state/config/useHelper'
import { usePoolSettings } from '../../state/poolSettings/hook'
import { ZERO_ADDRESS } from '../../utils/constant'
import { div, unwrap, zerofy } from '../../utils/helpers'
import { Box } from '../ui/Box'
import { CurrencyLogo } from '../ui/CurrencyLogo'
import { SwapIcon } from '../ui/Icon'
import { Input } from '../ui/Input'
import NumberInput from '../ui/Input/InputNumber'
import { SkeletonLoader } from '../ui/SkeletonLoader'
import { Text, TextBlue, TextGrey, TextSell } from '../ui/Text'
import '../OracleConfigBox/style.scss'
import { findFetcher } from '../../utils/deployHelper'
import { useWindowSize } from '../../hooks/useWindowSize'
import {ChainLinkPriceFeedData} from '../../state/poolSettings/type'
export const feeOptions = [100, 300, 500, 1000]
export const OracleConfigBox = () => {
  const {
    poolSettings,
    updatePoolSettings,
    calculateParamsForPools,
    setDeployError,
  } = usePoolSettings()
  const { ddlEngine, configs } = useConfigs()
  const [windowTimeSuggest, setWindowTimeSuggest] = useState<string[]>([])
  const { getTokenIconUrl } = useHelper()
  const { width } = useWindowSize()
  useEffect(() => {
    fetchPairInfo().catch(console.error)
  }, [poolSettings.pairAddress])

  useEffect(() => {
    if (poolSettings.baseToken) {
      calculateParamsForPools()
    }
  }, [poolSettings])

  const { getUniV3PairContract, getChainLinkPriceFeedContract} = useContract()

  const formatTokenType = async (token: any) => {
    const address = utils.getAddress(token.address)
    return {
      address,
      decimals: token.decimals,
      symbol: configs?.tokens?.[address]?.symbol || token.symbol || token.name,
      name: configs?.tokens?.[address]?.name || token.name,
      logoURI: configs?.tokens?.[address]?.logo || await getTokenIconUrl(address),
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
        const settings = poolSettings
        const { pairAddress } = settings
        const uniswapPair = getUniV3PairContract(poolSettings.pairAddress)
        let factory:any = ""

        try {
          factory = await uniswapPair.callStatic.factory()
        } catch (error) {
          const {pairAddress}= poolSettings
          const priceFeedContract = getChainLinkPriceFeedContract(pairAddress)
          const [ latestRoundData, decimals, description]:[ChainLinkPriceFeedData,number,string] = await Promise.all([
            priceFeedContract.callStatic.latestRoundData(),
            priceFeedContract.callStatic.decimals(),
            priceFeedContract.callStatic.description()
          ])
          const baseSymbol = description.split("/")[0].replace(" ", "")
          const quoteSymbol = description.split("/")[1].replace(" ", "")

          setFetchPairLoading(false)
          updatePoolSettings({
            pairAddress,
            chainLinkDecimals:decimals,
            chainLinkDesc:description,
            chainLinkLatestRoundData: latestRoundData,
            isChainLink:true,
            quoteToken: {
              symbol: quoteSymbol,
              name: quoteSymbol,
              decimals:0,
              address:""
            },
            baseToken: {
              symbol:baseSymbol,
              name:baseSymbol,
              decimals:0,
              address:""
            },          
          })
        }
        const [, fetcherType] = findFetcher(configs, factory)
        const pairV3 = fetcherType?.endsWith('3')

        // TODO: move slot0 and fee into UNIV3PAIR.getPairInfo
        const [{ token0, token1 }, slot0, fee] = await Promise.all([
          ddlEngine.UNIV3PAIR.getPairInfo({ pairAddress }),
          pairV3 ? uniswapPair.callStatic.slot0() : undefined,
          pairV3 ? uniswapPair.callStatic.fee() : undefined
        ])
        console.log("#",token0,token1)
        const tokens = await Promise.all([
          formatTokenType(token0),
          formatTokenType(token1)
        ])

        // detect QTI (quote token index)
        let QTI: 0 | 1 | undefined
        if (QTI == null && token0.symbol.includes('USD')) {
          QTI = 0
        }
        if (QTI == null && token1.symbol.includes('USD')) {
          QTI = 1
        }
        if (QTI == null && configs.stablecoins.includes(token0.address)) {
          QTI = 0
        }
        if (QTI == null && configs.stablecoins.includes(token1.address)) {
          QTI = 1
        }
        if (QTI == null && configs.wrappedTokenAddress == token0.address) {
          QTI = 0
        }
        if (QTI == null && configs.wrappedTokenAddress == token1.address) {
          QTI = 1
        }
        if (QTI == null) {
          QTI = 0
          // throw new Error('unable to detect QTI')
        }

        const baseToken = tokens[1 - QTI]
        const quoteToken = tokens[QTI]

        updatePoolSettings({
          QTI,
          baseToken,
          quoteToken,
          slot0,
          fee,
          factory,
          tokens,
          isChainLink: false,
          chainLinkDecimals: undefined,
          chainLinkLatestRoundData: undefined,
          chainLinkDesc: undefined,
          r0: token0.reserve,
          r1: token1.reserve
        })
        setFetchPairLoading(false)
      } catch (error) {
          setDeployError('Invalid Pool Address')
          setFetchPairLoading(false)
          updatePoolSettings({
            quoteToken: undefined,
            baseToken: undefined,
          })
      }
    }
  }

  const { baseToken, quoteToken } = poolSettings
  const searchKeyError = useMemo(() => {
    if (!baseToken) {
      return ''
    }
    const [s0, s1] = poolSettings.searchBySymbols
    const baseSymbol = baseToken.symbol.toUpperCase()
    const isDuplicatePlaceholder0 = s0 === baseSymbol.slice(1)
    const isDuplicatePlaceholder1 = s1 === baseSymbol.slice(0, -1)
    const isDuplicate = s0 !== '' && s0 === s1
    const isDuplicateBaseSymbol = s0 === baseSymbol || s1 === baseSymbol
    if (isDuplicate || isDuplicatePlaceholder0 || isDuplicatePlaceholder1) {
      return '(Duplicated)'
    }
    if (isDuplicateBaseSymbol) {
      return '(Same with base token symbol)'
    }
    return ''
  }, [baseToken?.symbol, poolSettings.searchBySymbols])
  return (
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
            placeholder='Uniswap v3 Pool or Chainlink Feed'
            onChange={(e) => {
              // @ts-ignore
              updatePoolSettings({
                pairAddress: (e.target as HTMLInputElement).value
              })
            }}
          />
        </div>
      </div>

      {fetchPairLoading || !quoteToken || !baseToken ? (
        <div className='oracle-config__select-token-box'>
          <SkeletonLoader
            height='50px'
            style={{ width: '100%' }}
            loading={fetchPairLoading}
          />
        </div>
      ) : (
        quoteToken.symbol &&
            baseToken.symbol && (
          <Fragment>
            <div className='oracle-config__select-token-box'>
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
              {!poolSettings.isChainLink ? 
                <div
                  onClick={() => {
                    updatePoolSettings({
                      QTI: poolSettings.QTI ? 0 : 1,
                      baseToken: poolSettings.quoteToken,
                      quoteToken: poolSettings.baseToken,
                      markPrice: div(1, poolSettings.markPrice)
                    })
                  
                  }}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    width: (width && width < 768) ? '100px' : 'auto',
                    minWidth: '40px'
                  }}
                >
                  <SwapIcon />
                </div>
              : ""}
              <div className='oracle-config__price-type'>
                <SkeletonLoader loading={poolSettings?.isChainLink ? !poolSettings.chainLinkLatestRoundData : poolSettings.markPrice=="0"}>
                   {
                    poolSettings.isChainLink ? 
                   zerofy(Number(poolSettings.chainLinkLatestRoundData?.answer) / 10 ** Number(poolSettings.chainLinkDecimals)):
                   zerofy(poolSettings.markPrice)
                   }
                </SkeletonLoader>
                {width && width < 768 ? '' : <TextGrey className='config-fee'>
                  {poolSettings.fee
                  ? `Uniswap V3 (${poolSettings.fee / 10_000}% fee)`
                  : ""}
                {!poolSettings.fee && !poolSettings.isChainLink && quoteToken?.symbol && baseToken.symbol
                    ? 'Uniswap V2'
                    : ''}
                {poolSettings.isChainLink && quoteToken?.symbol && baseToken.symbol
                    ? 'Chainlink'
                    : ''}
                </TextGrey> }
              </div>
            </div>
            <div style={{
              width: '100%',
              textAlign: 'center',
              marginTop: '1rem'
            }}>
              {width && width < 768 ? <TextGrey className='config-fee'>
                {poolSettings.fee
                  ? `Uniswap V3 (${poolSettings.fee / 10_000}% fee)`
                  : ""}
                {!poolSettings.fee && !poolSettings.isChainLink && quoteToken?.symbol && baseToken.symbol
                    ? 'Uniswap V2'
                    : ''}
                {poolSettings.isChainLink && quoteToken?.symbol && baseToken.symbol
                    ? 'Chainlink'
                    : ''}

              </TextGrey> : ''}
            </div>
          </Fragment>
        )
      )}

      <div className='mt-2 mb-1'>
        <Text fontSize={14} fontWeight={600}>
            Search Keywords{' '}
          {searchKeyError.length > 0 ? (
            <TextSell>{searchKeyError}</TextSell>
          ) : (
            ''
          )}
        </Text>
      </div>
      <div className='grid-container' style={{ gridTemplateColumns: 'auto auto auto' }}>

        <div className='config-item' key={-1}>
          <Input
            value={poolSettings.baseToken?.symbol?.toUpperCase()}
            placeholder='base symbol'
            disabled={true}
          />
        </div>
        {[0, 1].map((key, idx) => {
          return (
            <div className='config-item' key={idx}>
              <Input
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
                    ? baseToken?.symbol?.toUpperCase()?.slice(1)
                    : baseToken?.symbol?.toUpperCase()?.slice(0, -1)) || 'keyword'
              }
              />
            </div>
          )
        })}
      </div>
    </Box>
  )
}
