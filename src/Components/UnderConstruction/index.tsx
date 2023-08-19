import React from 'react'
import './style.scss'
import { DerivableIcon } from '../ui/Icon'
import { Text } from '../ui/Text'

export const UnderConstruction = () => {
  return <div className='under-construction__wrap'>
    <div className='under-construction__logo'>
      <DerivableIcon width={360} height={60} />
    </div>
    <Text fontWeight={700} fontSize={22}>UNDER CONSTRUCTION</Text>
  </div>
}
