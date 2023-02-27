import React from 'react'

type IconType = React.HTMLAttributes<HTMLOrSVGElement> & {
  fill?: string
}

export const IconArrowDown = (props: IconType) => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M15.7348 14.0909C16.1094 14.4968 16.0841 15.1294 15.6783 15.504L12.1783 18.7348C11.7953 19.0884 11.2048 19.0884 10.8218 18.7348L7.32172 15.504C6.9159 15.1294 6.89059 14.4968 7.26519 14.091C7.63979 13.6851 8.27245 13.6598 8.67827 14.0344L10.5 15.716L10.5 6C10.5 5.44772 10.9477 5 11.5 5C12.0523 5 12.5 5.44771 12.5 6L12.5 15.716L14.3217 14.0344C14.7275 13.6598 15.3602 13.6851 15.7348 14.0909Z'
        fill={props.fill ? props.fill : '#808191'}
      />
    </svg>
  )
}

export const IconArrowRight = (props: IconType) => {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path fillRule='evenodd' clipRule='evenodd'
        d='M14.0909 7.26521C14.4968 6.8906 15.1294 6.9159 15.504 7.32172L18.7348 10.8217C19.0884 11.2047 19.0884 11.7952 18.7348 12.1782L15.504 15.6783C15.1294 16.0841 14.4968 16.1094 14.091 15.7348C13.6851 15.3602 13.6598 14.7276 14.0344 14.3217L15.716 12.5L6 12.5C5.44771 12.5 5 12.0523 5 11.5C5 10.9477 5.44771 10.5 6 10.5L15.716 10.5L14.0344 8.67829C13.6598 8.27247 13.6851 7.63981 14.0909 7.26521Z'
        fill={props.fill ? props.fill : 'white'}
      />
    </svg>

  )
}

export const IconArrowLeft = (props: IconType) => {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path fillRule='evenodd' clipRule='evenodd' d='M9.90906 16.7348C9.50324 17.1094 8.87058 17.0841 8.49597 16.6783L5.2652 13.1783C4.9116 12.7953 4.9116 12.2048 5.26519 11.8218L8.49597 8.32172C8.87057 7.91589 9.50323 7.89059 9.90905 8.26519C10.3149 8.63979 10.3402 9.27245 9.96558 9.67827L8.28397 11.5L18 11.5C18.5523 11.5 19 11.9477 19 12.5C19 13.0523 18.5523 13.5 18 13.5L8.284 13.5L9.96557 15.3217C10.3402 15.7275 10.3149 16.3602 9.90906 16.7348Z'
        fill={props.fill ? props.fill : 'white'}
      />
    </svg>

  )
}

export const IconOptionLeft = (props: IconType) => {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path fillRule='evenodd' clipRule='evenodd'
        d='M2 16C1.44772 16 1 16.4477 1 17C1 17.5523 1.44772 18 2 18H13C13.5523 18 14 17.5523 14 17C14 16.4477 13.5523 16 13 16H2ZM19 16C18.4477 16 18 16.4477 18 17C18 17.5523 18.4477 18 19 18H22C22.5523 18 23 17.5523 23 17C23 16.4477 22.5523 16 22 16H19Z'
        fill='#808191' />
      <path fillRule='evenodd' clipRule='evenodd'
        d='M16 21C18.2091 21 20 19.2091 20 17C20 14.7909 18.2091 13 16 13C13.7909 13 12 14.7909 12 17C12 19.2091 13.7909 21 16 21Z'
        fill='#808191' />
      <path fillRule='evenodd' clipRule='evenodd'
        d='M2 6C1.44772 6 1 6.44772 1 7C1 7.55228 1.44772 8 2 8H5C5.55228 8 6 7.55228 6 7C6 6.44772 5.55228 6 5 6H2ZM11 6C10.4477 6 10 6.44772 10 7C10 7.55228 10.4477 8 11 8H22C22.5523 8 23 7.55228 23 7C23 6.44772 22.5523 6 22 6H11Z'
        fill='#808191' />
      <path
        d='M8 11C10.2091 11 12 9.20914 12 7C12 4.79086 10.2091 3 8 3C5.79086 3 4 4.79086 4 7C4 9.20914 5.79086 11 8 11Z'
        fill={props.fill ? props.fill : '#808191'} />
    </svg>

  )
}

export const CustomTokenIcon = (props: any) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={props.size ? props.size + 'px' : '24px'}
      height={props.size ? props.size + 'px' : '24px'}
      viewBox='0 0 24 24'
      fill='none'
      stroke='#000'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='sc-fZwumE evMpaO'
    >
      <circle cx='12' cy='12' r='10' />
      <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' />
      <line x1='12' y1='17' x2='12.01' y2='17' />
    </svg>
  )
}

export const SearchIcon = (props: any) => {
  return (
    <svg
      width={props.size ? props.size : '20'}
      height={props.size ? props.size : '20'}
      viewBox='0 0 20 20'
      fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path fillRule='evenodd' clipRule='evenodd'
        d='M12.4215 13.6C11.2925 14.4775 9.87401 15.0001 8.33342 15.0001C4.65152 15.0001 1.66675 12.0153 1.66675 8.33342C1.66675 4.65152 4.65152 1.66675 8.33342 1.66675C12.0153 1.66675 15.0001 4.65152 15.0001 8.33342C15.0001 9.87401 14.4775 11.2925 13.6 12.4215L18.0893 16.9108C18.4148 17.2363 18.4148 17.7639 18.0893 18.0893C17.7639 18.4148 17.2363 18.4148 16.9108 18.0893L12.4215 13.6ZM13.3334 8.33342C13.3334 11.0948 11.0948 13.3334 8.33342 13.3334C5.57199 13.3334 3.33341 11.0948 3.33341 8.33342C3.33341 5.57199 5.57199 3.33341 8.33342 3.33341C11.0948 3.33341 13.3334 5.57199 13.3334 8.33342Z'
        fill='#808191'
      />
    </svg>
  )
}

export const XIcon = (props: any) => {
  return (
    <svg
      width={props.size ? props.size : '10'}
      height={props.size ? props.size : '10'}
      viewBox='0 0 10 10'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M9.4714 9.47136C9.21105 9.73171 8.78894 9.73171 8.52859 9.47136L5 5.94277L1.4714 9.47136C1.21105 9.73171 0.788942 9.73171 0.528593 9.47136C0.268243 9.21101 0.268243 8.7889 0.528593 8.52855L4.05719 4.99996L0.528593 1.47136C0.268243 1.21101 0.268243 0.788904 0.528593 0.528555C0.788942 0.268205 1.21105 0.268205 1.4714 0.528555L5 4.05715L8.52859 0.528555C8.78894 0.268205 9.21105 0.268205 9.4714 0.528555C9.73175 0.788904 9.73175 1.21101 9.4714 1.47136L5.94281 4.99996L9.4714 8.52855C9.73175 8.7889 9.73175 9.21101 9.4714 9.47136Z'
        fill='#FF7A68'
      />
    </svg>
  )
}

export const DropDownIcon = (props: any) => {
  return (
    <svg
      width={props.size ? props.size : '10'}
      height={props.size ? props.size : '10'}
      viewBox='0 0 10 6'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M9.20711 0.792893C8.81658 0.402369 8.18342 0.402369 7.79289 0.792893L5 3.58579L2.20711 0.792893C1.81658 0.402369 1.18342 0.402369 0.792894 0.792893C0.402369 1.18342 0.402369 1.81658 0.792894 2.20711L4.29289 5.70711C4.68342 6.09763 5.31658 6.09763 5.70711 5.70711L9.20711 2.20711C9.59763 1.81658 9.59763 1.18342 9.20711 0.792893Z'
        fill='white'
      />
    </svg>
  )
}

export const PlusIcon = (props: any) => {
  return (
    <svg
      width={props.size ? props.size : '24'}
      height={props.size ? props.size : '24'}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M11 17C11 17.5523 11.4477 18 12 18C12.5523 18 13 17.5523 13 17V13H17C17.5523 13 18 12.5523 18 12C18 11.4477 17.5523 11 17 11H13L13 7C13 6.44771 12.5523 6 12 6C11.4477 6 11 6.44771 11 7L11 11L7 11C6.44771 11 6 11.4477 6 12C6 12.5523 6.44771 13 7 13L11 13V17Z'
        fill='#01A7FA'
      />
    </svg>
  )
}
