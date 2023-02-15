import { useDispatch, useSelector } from 'react-redux'
import {
  updateBalanceAndAllowancesReduce
} from '../reducer'
import { AllowancesType, BalancesType } from '../type'
import { useWeb3React } from '../../customWeb3React/hook'
import { useConfigs } from '../../config/useConfigs'
import { LARGE_VALUE } from '../../../utils/constant'
import { bn } from '../../../utils/helpers'

export const useWalletBalance = () => {
  const { balances, accFetchBalance, routerAllowances } = useSelector((state: any) => {
    return {
      balances: state.wallet.balances,
      routerAllowances: state.wallet.routerAllowances,
      accFetchBalance: state.wallet.accFetchBalance
    }
  })
  const { configs, ddlEngine } = useConfigs()
  const { account } = useWeb3React()

  const dispatch = useDispatch()

  const updateBalanceAndAllowances = ({
    balances,
    routerAllowances
  }: {
    balances: BalancesType,
    routerAllowances: AllowancesType
  }) => {
    dispatch(
      updateBalanceAndAllowancesReduce({
        account,
        balances,
        routerAllowances
      })
    )
  }

  const fetchBalanceAndAllowance = async (tokensArr: string[]) => {
    if (!ddlEngine) return
    const { balances, allowances } = await ddlEngine.BNA.getBalanceAndAllowance({
      tokens: tokensArr
    })
    updateBalanceAndAllowances({
      balances,
      routerAllowances: {
        ...allowances,
        [configs.addresses.nativeToken]: bn(LARGE_VALUE)
      }
    })
  }

  return {
    accFetchBalance,
    routerAllowances,
    balances,
    fetchBalanceAndAllowance
  }
}
