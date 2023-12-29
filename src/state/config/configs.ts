import { CHAINS } from '../../utils/constant'

export default {
  [CHAINS.ARBITRUM]: {
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    rpcToGetLogs: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    scanApi: 'https://api.arbiscan.io/api',
    candleChartApi: 'https://api.derivable.org/56/chart/',
    theGraphMessari:
      'https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-arbitrum',
    scanName: 'Arbitrum Scan',
    ddlGenesisBlock: 70615018,
    timePerBlock: 1000,
    nativeToken: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    },
    addresses: {
      nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      reserveTokenPrice: '0xBf4CC059DfF52AeFe7f12516e4CA4Bc691D97474',
      uniswapFactory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      token: '0x1BA630bEd23129aed65BFF106cd15C4B457a26e8',
      stateCalHelper: '0xa8724363831bd5a199aa37aa4641d184dd873653',
      multiCall: '0xcA11bde05977b3631167028862bE2a173976CA11',
      pairsInfo: '0x81C8f6bC2a602B9Ad403116ab4c0EC1a0e5B49B1',
      pairsV3Info: '0x81C8f6bC2a602B9Ad403116ab4c0EC1a0e5B49B1',
      bnA: '0x357FF35761979254F93a21995b20d9071904603d',
      tokensInfo: '0x696630d3aE600147902c71bF967ec3eb7a2C8b44',
      router: '0xbc9a257e43f7b3b1a03aEBE909f15e95A4928834',
      poolFactory: '0xF817EBA38BebD48a58AE38360306ea0E243077cd',
      wrapToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      wrapUsdPair: '0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443'
    },
    stableCoins: [
      '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'
    ]
  },
  [CHAINS.BASE]: {
    rpcUrl: 'https://mainnet.base.org',
    rpcToGetLogs: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    scanApi: 'https://api.basescan.org/api',
    candleChartApi: 'https://api.derivable.org/56/chart/',
    theGraphMessari:
      'https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-base',
    scanName: 'Base Scan',
    ddlGenesisBlock: 70615018,
    timePerBlock: 1000,
    nativeToken: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    },
    addresses: {
      nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      reserveTokenPrice: '0x0772BD1981f6092329F12FC041B83b2faBBB1A25',
      uniswapFactory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
      token: '0x2257157D2473A27c46DB6Cd25e36010D41cA36f1',
      stateCalHelper: '0xC6a8ABdCd1dCA7EF4727C50259F9dD4562B341F3',
      multiCall: '0xcA11bde05977b3631167028862bE2a173976CA11',
      pairsInfo: '0x81C8f6bC2a602B9Ad403116ab4c0EC1a0e5B49B1',
      pairsV3Info: '0x81C8f6bC2a602B9Ad403116ab4c0EC1a0e5B49B1',
      bnA: '0x357FF35761979254F93a21995b20d9071904603d',
      tokensInfo: '0x696630d3aE600147902c71bF967ec3eb7a2C8b44',
      router: '0xb29647dd03F9De2a9Fe9e32DF431dA5015c60353',
      poolFactory: '0x3B202cef7108C2b13dDbEfDCd9d3df9FBafa5c7b',
      logic: '0x44B364Ce68381138d271D58e639C5AC41e770F25',
      wrapToken: '0x4200000000000000000000000000000000000006',
      wrapUsdPair: '0x4C36388bE6F416A29C8d8Eee81C771cE6bE14B18'
    },
    stableCoins: [
      '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca',
      '0x50c5725949a6f0c72e6c4a641f24049a917db0cb'
    ]
  },
  [CHAINS.BSC]: {
    rpcUrl: 'https://bsc-dataseed3.binance.org',
    rpcToGetLogs: 'https://bscrpc.com',
    explorer: 'https://bscscan.com',
    scanApi: 'https://api.bscscan.com/api',
    candleChartApi: 'https://api.derivable.org/56/chart/',
    theGraphMessari:
      'https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-bsc',
    scanName: 'BscScan',
    ddlGenesisBlock: 70615018,
    timePerBlock: 3000,
    nativeToken: {
      name: 'BNB',
      symbol: 'BNB',
      decimal: 18,
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    },
    addresses: {
      nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      reserveTokenPrice: '0x0772BD1981f6092329F12FC041B83b2faBBB1A25',
      uniswapFactory: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
      token: '0x0819281c74BeD5423C1B3283808F8E26AAd18DBe',
      stateCalHelper: '0xC763aaE65755d72b59F8A82f2640a657147131B4',
      multiCall: '0xcA11bde05977b3631167028862bE2a173976CA11',
      // pairsInfo: '0x81C8f6bC2a602B9Ad403116ab4c0EC1a0e5B49B1',
      // pairsV3Info: '0x81C8f6bC2a602B9Ad403116ab4c0EC1a0e5B49B1',
      bnA: '0x357FF35761979254F93a21995b20d9071904603d',
      // tokensInfo: '0x696630d3aE600147902c71bF967ec3eb7a2C8b44',
      router: '0xb29647dd03F9De2a9Fe9e32DF431dA5015c60353',
      poolFactory: '0x3B202cef7108C2b13dDbEfDCd9d3df9FBafa5c7b',
      logic: '0x838faCe8CA0256e7C3a6ae4F60CDB7318e986360',
      wrapToken: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      wrapUsdPair: '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16'
    },
    stableCoins: [
      '0x55d398326f99059fF775485246999027B3197955',
      '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
    ]
  }
}
