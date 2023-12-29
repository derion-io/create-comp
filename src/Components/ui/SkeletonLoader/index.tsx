import React, { useRef } from 'react'
import './style.scss'

export const SkeletonLoader = (
  props: React.HTMLAttributes<HTMLDivElement> & { loading: boolean }
) => {
  const { loading, ...rest } = props
  const contentRef = useRef(null)
  return (
    <div
      style={{
        // @ts-ignore
        height: contentRef.current?.clientHeight || 18
      }}
      className={`skeleton-loader ${props.className}`}
      {...rest}
    >
      {loading && <div className='skeleton-loader__bone' />}
      <div className={`${loading && 'content-hidden'}`} ref={contentRef}>
        {props.children}
      </div>
    </div>
  )
}
