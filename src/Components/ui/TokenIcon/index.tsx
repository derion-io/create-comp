import React, { useEffect, useMemo, useState } from 'react'
import { CustomTokenIcon } from '../Icon'
import { useHelper } from '../../../state/config/useHelper'
import './style.scss'

export const TokenIcon = (props: {
  src?: string
  tokenAddress?: string
  size?: number
}) => {
  const { tokenAddress, ...rest } = props
  const { getTokenIconUrl } = useHelper()
  const [isError, setIsError] = useState<boolean>(!props.src)

  const onError = () => {
    setIsError(true)
  }

  useEffect(() => {
    setIsError(false)
  }, [props.src])

  const src = useMemo(() => {
    if (props.src) return props.src
    if (!tokenAddress) return ''
    return getTokenIconUrl(tokenAddress)
  }, [props])

  if (isError || !src) {
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
        src={src}
      />
    )
  }
}
