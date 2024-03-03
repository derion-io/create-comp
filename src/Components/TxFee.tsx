import React from 'react'
import { BigNumber } from 'ethers'
import { useConfigs } from '../state/config/useConfigs'
import { Box } from './ui/Box'
import { useNativePrice } from '../hooks/useTokenPrice'
import { formatWeiToDisplayNumber } from '../utils/formatBalance'
import { bn, numberToWei, weiToNumber } from '../utils/helpers'
import { Text, TextGrey } from './ui/Text'
import { useFeeData } from '../state/pools/hooks/useFeeData'

export const TxFee = ({ gasUsed }: { gasUsed: BigNumber }) => {
  const { chainId } = useConfigs()
  const { data: nativePrice } = useNativePrice()
  const { feeData } = useFeeData()
  const gasPrice = bn(feeData?.gasPrice ?? 1)

  return (
    <Box borderColor='default' className='swap-info-box mt-1 mb-1 p-1'>
      <InfoRow className='mb-1'>
        <TextGrey>Gas Used</TextGrey>
        <span>
          <Text>{formatWeiToDisplayNumber(gasUsed, 0, 0)} Gas</Text>
        </span>
      </InfoRow>
      <InfoRow>
        <TextGrey>Transaction Fee</TextGrey>
        <span>
          <Text>
            {weiToNumber(gasUsed.mul(gasPrice), 18, 5)}
            <TextGrey> {chainId === 56 ? 'BNB' : 'ETH'} </TextGrey>
            ($
            {weiToNumber(
              gasUsed.mul(gasPrice).mul(numberToWei(nativePrice)),
              36,
              2
            )}
            )
          </Text>
        </span>
      </InfoRow>
    </Box>
  )
}

const InfoRow = (props: any) => {
  return (
    <div
      className={
        'd-flex jc-space-between info-row font-size-12 ' + props.className
      }
    >
      {props.children}
    </div>
  )
}
