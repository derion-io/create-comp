# Pools-comp

## Setup Ganache network for testing
1. Use this MNEMONIC, and set init balance = `10000000000 ETH` instead of `100 ETH`
```
kick balcony people guess oppose verb faint explain spoil learn that pool
```
2. Go to branch `deploy-on-ganache-network` of `https://github.com/derion-io/contracts` and run this script to deploy contract
```
yarn deploy:ganache
```

## Installation and usage
1. install package
```
  yarn
```

2. install mockup package
```
  cd mockup
  yarn
```

3. Open 2 terminal and run 2 parallel command
```
  yarn start
```
and
```
  yarn mockup:watch
```
