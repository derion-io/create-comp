import React, { useState } from 'react'
import { Text, TextBlue } from '../ui/Text'
import { Input } from '../ui/Input'
import { Box } from '../ui/Box'
import './style.scss'

export const ChangeableConfigBox = () => {
  const [dailyFundingRate, setDailyFundingRate] = useState<string>('0')

  return <Box
    borderColor='blue'
    className='changeable-config-box mt-2'
  >
    <TextBlue className='changeable-config__title'>
      Changeable Config
    </TextBlue>
    <div className='config-item'>
      <Text fontSize={14} fontWeight={600}>
        Daily funding rate (%)
      </Text>
      <Input
        inputWrapProps={{
          className: 'config-input'
        }}
        type='number'
        placeholder='0'
        onChange={(e) => {
          // @ts-ignore
          if (Number(e.target.value) >= 0) {
            setDailyFundingRate((e.target as HTMLInputElement).value)
          }
        }}
      />
    </div>

    <div className='config-item mt-18px'>
      <Text fontSize={14} fontWeight={600}>
        Maturity
      </Text>
      <Input
        inputWrapProps={{
          className: 'config-input'
        }}
        type='number'
        placeholder='0'
        onChange={(e) => {
          // @ts-ignore
          if (Number(e.target.value) >= 0) {
            setDailyFundingRate((e.target as HTMLInputElement).value)
          }
        }}
      />
    </div>

    <div className='config-item mt-18px'>
      <Text fontSize={14} fontWeight={600}>
        Premium rate
      </Text>
      <Input
        inputWrapProps={{
          className: 'config-input'
        }}
        type='number'
        placeholder='0'
        onChange={(e) => {
          // @ts-ignore
          if (Number(e.target.value) >= 0) {
            setDailyFundingRate((e.target as HTMLInputElement).value)
          }
        }}
      />
    </div>

    <div className='config-item mt-18px'>
      <Text fontSize={14} fontWeight={600}>
        Lock discount rate
      </Text>
      <Input
        inputWrapProps={{
          className: 'config-input'
        }}
        type='number'
        placeholder='0'
        onChange={(e) => {
          // @ts-ignore
          if (Number(e.target.value) >= 0) {
            setDailyFundingRate((e.target as HTMLInputElement).value)
          }
        }}
      />
    </div>
  </Box>
}
