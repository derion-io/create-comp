import React from 'react'
import './style.scss'
export const CurrencyLogo = (props: {
  src?: string
  className?: string
  currencyURI?: string
  size?: number
}) => {
  return (
    <img
      loading='lazy'
      // onError={() => {
      //   setUrl(props.currencyURI)
      // }}
      style={{
        width: props.size || 50,
        height: props.size || 50,
        borderRadius: '50%',
        transition: 'opacity 250ms ease-in 0s'
      }}
      {...props}
      src={props.currencyURI}
    />
  )
}