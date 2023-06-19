import React, { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Box } from '../ui/Box'
import { TokenIcon } from '../ui/TokenIcon'
import { useWalletBalance } from '../../state/wallet/hooks/useBalances'
import { TokenSymbol } from '../ui/TokenSymbol'
import { Text } from '../ui/Text'
import './style.scss'
import { formatWeiToDisplayNumber } from '../../utils/formatBalance'
import isEqual from 'react-fast-compare'
import { TokenType } from '../../state/token/type'
import { Input } from '../ui/Input'
import { useContract } from '../../hooks/useContract'
import { utils } from 'ethers'
import { useListTokens } from '../../state/token/hook'

const Component = ({
  visible,
  setVisible,
  iniTokens,
  onSelectToken
}: {
  visible: boolean,
  setVisible: any,
  iniTokens: TokenType[],
  onSelectToken: any,
}) => {
  const { balances } = useWalletBalance()
  const [tokenAddress, setTokenAddress] = useState<string>('')
  const { getTokenInfoContract } = useContract()
  const { tokens, addTokenToList } = useListTokens()
  const tokensArr = Object.values(tokens)

  useEffect(() => {
    fetchTokenInfo()
  }, [tokenAddress])

  const fetchTokenInfo = async () => {
    try {
      if (!utils.isAddress(tokenAddress)) {
        return
      }
      const contract = getTokenInfoContract()
      const res = await contract.getTokenInfo([tokenAddress])

      addTokenToList({
        address: utils.getAddress(tokenAddress),
        decimal: res[0].decimals,
        symbol: res[0].symbol,
        name: res[0].name
      })
      console.log(res)
    } catch (e) {
    }
  }

  return <Modal
    setVisible={setVisible}
    visible={visible}
    title='Select token'
  >
    <div>
      <Input
        value={tokenAddress}
        onChange={(e) => {
          setTokenAddress(e.target.value)
        }}
      />
    </div>

    <div className='select-token-modal'>
      {
        tokensArr.map((token: any, key: number) => {
          const fee: string | any = ''
          const symbol = <TokenSymbol token={token} />
          return <Box
            key={key}
            className='option'
            onClick={() => {
              onSelectToken(token)
              setVisible(false)
            }}
          >
            <div className='jc-space-between align-item-center'>
              <div className='option__icon-and-name'>
                <TokenIcon size={24} tokenAddress={token.address} />
                <Text>{symbol}</Text>
                {fee}
              </div>
              <span>
                {balances && balances[token.address]
                  ? formatWeiToDisplayNumber(
                    balances[token.address],
                    4,
                    token?.decimal || 18
                  )
                  : 0}
              </span>
            </div>
          </Box>
        })
      }
    </div>
  </Modal>
}

export const SelectTokenModal = React.memo(Component, (prevProps, nextProps) =>
  isEqual(prevProps, nextProps)
)
