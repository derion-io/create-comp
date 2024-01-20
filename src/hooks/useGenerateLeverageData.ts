import { useMemo } from 'react'
import { NATIVE_ADDRESS, POOL_IDS, ZERO_ADDRESS } from '../utils/constant'
import { useTokenValue } from './useTokenValue'
import { bn, numberToWei, weiToNumber } from '../utils/helpers'
import { useListTokens } from '../state/token/hook'
import { useListPool } from '../state/pools/hooks/useListPool'
import { PoolType } from '../state/types'
import _ from 'lodash'

const barColors = ['#01A7FA', '#FF98E5', '#4FBF67', '#3DBAA2']

export const useGenerateLeverageData = (
  pairAddr: string,
  power: string,
  amountIn: string
) => {
  const { tokens } = useListTokens()
  const { getTokenValue } = useTokenValue({})
  const { poolGroups } = useListPool()
  const pools: PoolType = useMemo(() => {
    return (pairAddr ? poolGroups[Object.keys(poolGroups)[0]]?.pools : {}) || {}
  }, [pairAddr, poolGroups])

  const oldLeverageData = useMemo(() => {
    const result = {}
    if (Object.values(pools || {})?.length > 0) {
      Object.values(pools).forEach((pool) => {
        const size = bn(pool.states.R)
        // console.log(
        //   '#pools',
        //   pool,
        //   pool.TOKEN_R,
        //   weiToNumber(pool.states.R, tokens[pool.TOKEN_R]?.decimals)
        // )
        const power = Math.abs(pool.k.toNumber() / 2)

        if (!result[power]) {
          result[power] = {
            x: Number(power),
            xDisplay: power + 'x',
            totalSize: size,
            bars: [
              {
                x: power,
                token: pool.poolAddress + '-' + POOL_IDS.C,
                size,
                color: barColors[0]
                // isDashed: true
              }
            ]
          }
        } else {
          const bars = result[power].bars
          bars.push({
            x: Number(power),
            token: pool.poolAddress + '-' + POOL_IDS.C,
            size,
            color: barColors[bars.length]
            // isDashed: true
          })
          result[power].bars = bars
          result[power].totalSize = result[power].totalSize.add(size)
        }
      })
    }

    return result
  }, [pools, poolGroups])

  return useMemo(() => {
    const result = _.cloneDeep(oldLeverageData)

    if (amountIn && Number(power) > 0) {
      const size = bn(numberToWei(getTokenValue(NATIVE_ADDRESS, amountIn)))

      if (oldLeverageData[power]) {
        result[power].bars.push({
          x: Number(power),
          token: ZERO_ADDRESS + '-' + POOL_IDS.C,
          size,
          color: '#01a7fa',
          isDashed: true
        })
        result[power].totalSize = result[power].totalSize.add(size)
      } else {
        result[power] = {
          x: Number(power),
          xDisplay: power + 'x',
          totalSize: size,
          bars: [
            {
              x: power,
              token: ZERO_ADDRESS + '-' + POOL_IDS.C,
              size,
              color: '#01a7fa',
              isDashed: true
            }
          ]
        }
      }
    }

    let maxTotalSize = bn(0)
    for (const i in result) {
      if (result[i].totalSize.gt(maxTotalSize)) {
        maxTotalSize = result[i].totalSize
      }
    }

    let data = Object.values(result)
    data = data.map((leverage: any) => {
      const bars = leverage.bars.map((bar: any) => {
        return {
          ...bar,
          reserve: bar.size,
          size:
            bar.size
              .mul(10000)
              .div(bn(maxTotalSize).eq(bn(0)) ? bn(1) : bn(maxTotalSize))
              .toNumber() / 100
          // size: 50 + leverage.x
        }
      })

      return {
        ...leverage,
        bars: bars.sort((a: any, b: any) => b.size - a.size)
      }
    })

    return data
  }, [amountIn, power, oldLeverageData, poolGroups])
}
