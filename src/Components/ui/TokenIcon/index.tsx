import React, { useEffect, useMemo, useState } from 'react'
import { CustomTokenIcon } from '../Icon'
import { useHelper } from '../../../state/config/useHelper'
import './style.scss'
import { utils } from 'ethers'
import { useConfigs } from '../../../state/config/useConfigs'

export const TokenIcon = (props: {
  src?: string
  tokenAddress?: string
  size?: number
}) => {
  const { tokenAddress, ...rest } = props
  const { getTokenIconUrl } = useHelper()
  const { configs } = useConfigs()
  const [isError, setIsError] = useState<boolean>(false)
  const [logoURI, setLogoURI] = useState<string>('')
  const onError = () => {
    setIsError(true)
  }

  useEffect(() => {
    if (tokenAddress) {
      getTokenIconUrl(utils.getAddress(tokenAddress || '')).then((res) => {
        console.log('#tokenAddress', utils.getAddress(tokenAddress || ''))
        console.log('#token', res)
        setLogoURI(res)
      })
    }
  }, [tokenAddress, configs])
  if (isError && !logoURI) {
    return <CustomTokenIcon size={props.size || 50} {...props} />
  } else {
    return (
      <img
        onError={onError}
        style={{
          width: props.size || 50,
          height: props.size || 50,
          borderRadius: '50%'
        }}
        {...rest}
        src={logoURI}
      />
    )
  }
}
