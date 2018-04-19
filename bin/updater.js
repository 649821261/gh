#!/usr/bin/env node

const axios = require('axios')
const contract = require('truffle-contract')
const Web3 = require('web3')

const PreIcoJson = require('../build/contracts/PreIco.json')

const PreIco = contract(PreIcoJson)
const provider = new Web3.providers.HttpProvider('http://localhost:8545')
PreIco.setProvider(provider)

const web3 = new Web3(provider)

web3.eth.defaultAccount = web3.eth.accounts[0]

const xccValue = web3.toBigNumber(0.05)  // value of XCC in EUR

let ethValue  // value of ETH in EUR
/*
try {
  if (process.argv[2]) {
    ethValue = web3.toBigNumber(process.argv[2])
  }
} catch (e) {
  console.error('Incorrect ETH/EUR change value')
  process.exit(1)
}
*/
console.log(`1 XCC = ${xccValue} EUR`)

const main = async () => {
  const url = 'https://api.coinmarketcap.com/v1/ticker/ethereum'
  try {
    const {data} = await axios.get(url, {
      params: {
        convert: 'EUR'
      }
    })
    ethValue = data[0].price_eur
  } catch (err) {
    console.error(`Unable to get ETH/EUR price (${err})`)
    process.exit(1)
  }

  console.log(`1 ETH = ${ethValue} EUR`)

  const xccETH = xccValue.times(web3.toWei(1, 'ether')).div(ethValue).round(0)
    .valueOf()  // see https://github.com/ethereum/web3.js/issues/925

  process.stdout.write(`Setting XCC value to ${xccETH} WEI...`)

  try {
    const instance = await PreIco.deployed()
    await instance.updateValue(xccETH, {gasPrice: 1000000000})  // 10^9 WEI
    console.log(' done.')
  } catch (err) {
    console.error('\n' + err)
    process.exit(1)
  }
}

const updateInteval = 60 * 1000

setInterval(main, updateInteval)
