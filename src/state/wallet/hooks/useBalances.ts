import { useDispatch, useSelector } from 'react-redux'
import {
  updateBalanceAndAllowancesReduce
} from '../reducer'
import { AllowancesType, BalancesType } from '../type'
import { useWeb3React } from '../../customWeb3React/hook'
import { useConfigs } from '../../config/useConfigs'
import { ethers } from 'ethers'
import ERC20Abi from '../../../assets/abi/IERC20.json'
import {LARGE_VALUE, NATIVE_ADDRESS, POOL_IDS, ZERO_ADDRESS} from '../../../utils/constant'
import { toast } from 'react-toastify'
import {
  bn,
  decodeErc1155Address,
  isErc1155Address,
  parseCallStaticError
} from '../../../utils/helpers'
import { messageAndViewOnBsc } from '../../../Components/MessageAndViewOnBsc'
import { useContract } from '../../../hooks/useContract'
import { useCurrentPool } from '../../currentPool/hooks/useCurrentPool'

export const useWalletBalance = () => {
  const { getPoolContract } = useContract()
  const { powers, poolAddress } = useCurrentPool()
  const { balances, accFetchBalance, routerAllowances } = useSelector((state: any) => {
    return {
      balances: state.wallet.balances,
      routerAllowances: state.wallet.routerAllowances,
      accFetchBalance: state.wallet.accFetchBalance
    }
  })
  const { configs, ddlEngine } = useConfigs()
  const { library } = useWeb3React()

  const dispatch = useDispatch()

  const updateBalanceAndAllowances = ({
    chainId,
    account,
    balances,
    routerAllowances
  }: {
    chainId: number,
    account: string,
    balances: BalancesType,
    routerAllowances: AllowancesType
  }) => {
    dispatch(
      updateBalanceAndAllowancesReduce({
        chainId,
        account,
        balances,
        routerAllowances
      })
    )
  }

  const approveRouter = async ({
    chainId,
    account,
    tokenAddress,
  }: {
    chainId: number,
    account: string,
    tokenAddress: string,
  }) => {
    if (!chainId || !account || !library) {
      toast.error('Please connect the wallet')
      return
    }
    try {
      const signer = library.getSigner()
      let hash = ''
      if (tokenAddress === poolAddress || isErc1155Address(tokenAddress)) {
        const poolAddress = decodeErc1155Address(tokenAddress).address
        const contract = getPoolContract(poolAddress, signer)
        const txRes = await contract.setApprovalForAll(configs.helperContract.utr, true)
        await txRes.wait(1)
        hash = txRes.hash

        const routerAllowances = {
          [tokenAddress]: bn(LARGE_VALUE),
          [tokenAddress + '-' + POOL_IDS.cp]: bn(LARGE_VALUE)
        }
        powers.forEach((power, key) => {
          routerAllowances[poolAddress + '-' + key] = bn(LARGE_VALUE)
        })

        updateBalanceAndAllowances({
          chainId,
          account,
          balances: {},
          routerAllowances,
        })
      } else {
        const contract = new ethers.Contract(tokenAddress, ERC20Abi, signer)
        const txRes = await contract.approve(configs.helperContract.utr, LARGE_VALUE)
        await txRes.wait(1)
        hash = txRes.hash
        updateBalanceAndAllowances({
          chainId,
          account,
          balances: {},
          routerAllowances: { [tokenAddress]: bn(LARGE_VALUE) } },
        )
      }
      toast.success(
        messageAndViewOnBsc({
          title: 'Approve success',
          hash
        })
      )
    } catch (e) {
      toast.error(parseCallStaticError(e))
    }
  }

  const fetchBalanceAndAllowance = async (tokens: string[]) => {
    if (!ddlEngine) return
    if (!ddlEngine.BNA.account || ddlEngine.BNA.account == ZERO_ADDRESS) {
      return
    }
    const { chainId, account, balances, allowances } = await ddlEngine.BNA.getBalanceAndAllowance(tokens)
    console.log(chainId, account, balances, allowances)
    updateBalanceAndAllowances({
      chainId,
      account,
      balances,
      routerAllowances: {
        ...allowances,
        [NATIVE_ADDRESS]: bn(LARGE_VALUE)
      }
    })
  }

  return {
    accFetchBalance,
    routerAllowances,
    balances,
    fetchBalanceAndAllowance,
    approveRouter
  }
}
