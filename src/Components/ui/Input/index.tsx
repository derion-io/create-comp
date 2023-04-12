import React, { useState } from 'react'
import './style.scss'
import { InputProps } from 'reactstrap'

type InputType = InputProps & {
  inputWrapProps?: React.HTMLAttributes<HTMLDivElement>
  prefix?: any
  suffix?: any
}

export const Input = (props: InputType) => {
  const { inputWrapProps, ...rest } = props
  const [isFocusing, setIsFocusing] = useState<boolean>(false)
  return (
    <div
      {...rest}
      className={`derivable-input-wrap ${isFocusing && 'focus'} ${inputWrapProps?.className} `}
    >
      {rest.prefix && (
        <div className='derivable-input__prefix'>{rest.prefix}</div>
      )}
      <input
        type='text'
        {...rest}
        onFocus={(e) => {
          setIsFocusing(true)
          if (rest.onFocus) {
            rest.onFocus(e)
          }
        }}
        onBlur={(e) => {
          setIsFocusing(false)
          if (rest.onBlur) {
            rest.onBlur(e)
          }
        }}
        className={`derivable-input ${rest.className} `}
      />
      {rest.suffix && (
        <div className='derivable-input__suffix'>{rest.suffix}</div>
      )}
    </div>
  )
}
