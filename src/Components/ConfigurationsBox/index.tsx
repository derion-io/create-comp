import React, { useEffect, useState } from 'react'
import { useConfigs } from '../../state/config/useConfigs'
import { useHelper } from '../../state/config/useHelper'
import { usePoolSettings } from '../../state/poolSettings/hook'
import { Box } from '../ui/Box'
import NumberInput from '../ui/Input/InputNumber'
import { Text, TextBlue, TextSell } from '../ui/Text'
import '../OracleConfigBox/style.scss'
export const feeOptions = [100, 300, 500, 1000]
export const ConfigurationsBox = () => {
  const { poolSettings, updatePoolSettings, calculateParamsForPools } =
    usePoolSettings()
  const [windowTimeSuggest, setWindowTimeSuggest] = useState<string[]>([])

  useEffect(() => {
    if (poolSettings.baseToken) {
      calculateParamsForPools()
    }
  }, [poolSettings])

  return (

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
          value={poolSettings.slot0 ? poolSettings.window : poolSettings.windowBlocks}
          onValueChange={(e) => {
            updatePoolSettings(
              poolSettings.slot0
                ? {
                  windowBlocks: (e.target as HTMLInputElement).value
                }
                : {
                  window: (e.target as HTMLInputElement).value
                }
            )
          }}
          suffix={poolSettings.slot0 ? 'seconds' : 'blocks'}
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
            value={poolSettings.power}
            onValueChange={(e) => {
              updatePoolSettings({ power: e.target.value })
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
          value={poolSettings.interestRate}
          onValueChange={(e) => {
            updatePoolSettings({ interestRate: e.target.value })
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
          value={poolSettings.premiumRate}
          onValueChange={(e) => {
            updatePoolSettings({ premiumRate: e.target.value })
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
            updatePoolSettings({ openingFee: e.target.value })
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
          value={poolSettings.vesting}
          onValueChange={(e) => {
            updatePoolSettings({ vesting: e.target.value })
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
          value={poolSettings.closingFee}
          onValueChange={(e) => {
            updatePoolSettings({ closingFee: e.target.value })
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
          value={poolSettings.closingFeeDuration}
          onValueChange={(e) => {
            updatePoolSettings({ closingFeeDuration: e.target.value })
          }}
          suffix='hours'
        />
      </div>
    </Box>
  )
}
