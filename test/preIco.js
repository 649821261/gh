/* global artifacts contract it web3 */

const assert = require('assert')

const getBalances = require('../src/getBalances')

const PreIco = artifacts.require('./PreIco.sol')

contract('PreIco (token costants)', () => {
  const total = '3152291.576900481844069068'
  const decimals = 18
  const oneXCC = web3.toBigNumber(10).pow(decimals)

  it(`token should have ${decimals} decimal digits`, async () => {
    const instance = await PreIco.deployed()
    const res = await instance.decimals.call()
    assert(
      res.equals(decimals),
      `${decimals} wasn't the number of decimal digits`
    )
  })

  it(`total supply of tokens should be ${total}`, async () => {
    const instance = await PreIco.deployed()
    const initialSupply = await instance.initialSupply.call()
    const remainingSupply = await instance.remainingSupply.call()
    assert(
      initialSupply.equals(web3.toBigNumber(total).times(oneXCC)),
      `${total} wasn't the initial supply`
    )
    assert(
      remainingSupply.equals(web3.toBigNumber(total).times(oneXCC)),
      `${total} wasn't the remaining supply`
    )
  })
})

contract('PreIco (token value)', (accounts) => {
  const newUpdater = accounts[1]

  it('should have an initial token value of zero', async () => {
    const instance = await PreIco.deployed()
    const res = await instance.tokenValue.call()
    assert(res.equals(0), 'token value was not zero')
  })

  it('should be able update the token updater account', async () => {
    const instance = await PreIco.deployed()
    await instance.updateUpdater(newUpdater)
    const res = await instance.updater.call()
    assert.equal(newUpdater, res, 'updater account was not changed correctly')
  })

  it('should be able to update its token value', async () => {
    const newValue = web3.toBigNumber(10).pow(12)
    const instance = await PreIco.deployed()
    const update = await instance.updateValue(newValue, {from: newUpdater})

    assert.equal(update.logs.length, 1, 'number of events was not 1')
    const event = update.logs[0]
    assert.equal(event.event, 'UpdateValue', 'event was not "UpdateValue"')
    assert(event.args.newValue.equals(newValue), 'event argument "newValue" incorrect')

    const res = await instance.tokenValue.call()
    assert(res.equals(newValue), 'token value was not updated')
  })
})

contract('PreIco (time frame)', () => {
  const initialEnd = (new Date(Date.UTC(2017, 9, 1))).getTime()
  const initialEndString = (new Date(initialEnd).toString())

  it('start block should be the deployment block', async () => {
    const instance = await PreIco.deployed()
    const previousBlock = web3.eth.blockNumber - 1  // last block used for setCompleted method of Migrations
    const res = await instance.startBlock.call()
    assert(
      res.equals(previousBlock),
      `start block was not ${previousBlock}`
    )
  })

  it(`initial end time should be ${initialEndString}`, async () => {
    const instance = await PreIco.deployed()
    const res = await instance.endTime.call()
    assert(
      res.equals(Math.floor(initialEnd / 1000)),
      `initial end time was not ${initialEndString}`
    )
  })

  const newEndTime = Math.floor(Date.now() / 1000) + 120  // two minutes from now
  const newEndTimeString = (new Date(newEndTime * 1000)).toString()

  it(`should be able to update the ICO end time (${newEndTimeString})`, async () => {
    const instance = await PreIco.deployed()
    await instance.updateEndTime(newEndTime)
    const res = await instance.endTime.call()
    assert(res.equals(newEndTime), 'end time was not updated correctly')
  })
})

contract('PreIco (buy tokens)', (accounts) => {
  web3.eth.defaultAccount = accounts[0]

  it('should assign tokens', async () => {
    const instance = await PreIco.deployed()
    const address = instance.address
    const newValue = web3.toBigNumber(10).pow(12)
    await instance.updateValue(newValue)
    const newEndTime = Math.floor(Date.now() / 1000) + 120
    await instance.updateEndTime(newEndTime)
    const value = web3.toWei(1, 'ether')

    const send = await instance.sendTransaction({to: address, value})
    assert.equal(send.logs.length, 1, 'number of events was not 1')
    const event = send.logs[0]
    assert.equal(event.event, 'AssignToken', 'event was not "AssignToken"')
    assert.equal(event.args.to, web3.eth.defaultAccount, 'event argument "to" incorrect')
    const decimals = await instance.decimals.call()
    const oneXCC = web3.toBigNumber(10).pow(decimals)
    const tokenValue = await instance.tokenValue.call()
    const assignedTokens = oneXCC.times(value).div(tokenValue)

    assert(event.args.value.equals(assignedTokens), 'event argument "value" incorrect')

    const initialSupply = await instance.initialSupply.call()
    const remainingSupply = await instance.remainingSupply.call()

    assert(
      remainingSupply.add(event.args.value).equals(initialSupply),
      'remaining supply was not updated correctly'
    )

    const contractBalance = web3.eth.getBalance(address)
    assert(contractBalance.equals(value), 'amount of Ethers on contract is not correct')
  })
})

contract('PreIco (dump balances)', (accounts) => {
  it('should show the current investor balances', async () => {
    const instance = await PreIco.deployed()
    const address = instance.address
    const newValue = web3.toBigNumber(10).pow(12)
    await instance.updateValue(newValue)
    const newEndTime = Math.floor(Date.now() / 1000) + 120
    await instance.updateEndTime(newEndTime)

    const v0 = web3.toWei(1, 'ether')
    await instance.sendTransaction({from: accounts[0], to: address, value: v0})

    const v1 = web3.toWei(1.5, 'ether')
    await instance.sendTransaction({from: accounts[1], to: address, value: v1})

    const v2 = web3.toWei(0.5, 'ether')
    await instance.sendTransaction({from: accounts[2], to: address, value: v2})

    const v3 = web3.toWei(0.1, 'ether')
    await instance.sendTransaction({from: accounts[2], to: address, value: v3})

    const decimals = await instance.decimals.call()
    const oneXCC = web3.toBigNumber(10).pow(decimals)
    const startBlock = await instance.startBlock.call()
    const b1 = await getBalances(address, startBlock, web3)
    const b2 = {
      [accounts[0]]: web3.toBigNumber(v0).times(oneXCC).div(newValue),
      [accounts[1]]: web3.toBigNumber(v1).times(oneXCC).div(newValue),
      [accounts[2]]: web3.toBigNumber(v2).plus(web3.toBigNumber(v3)).times(oneXCC).div(newValue)
    }
    assert.deepEqual(b1, b2, 'incorrect balances')
  })
})

contract('PreIco (withdraw)', (accounts) => {
  web3.eth.defaultAccount = accounts[0]

  it('should allow the owner to withdraw Ethers', async () => {
    const instance = await PreIco.deployed()
    const address = instance.address
    const newValue = web3.toBigNumber(10).pow(12)
    await instance.updateValue(newValue)
    const newEndTime = Math.floor(Date.now() / 1000) + 120
    await instance.updateEndTime(newEndTime)
    const value = web3.toWei(1, 'ether')

    // buy the token
    await web3.eth.sendTransaction({to: address, value})

    const oldBalance = await web3.eth.getBalance(accounts[0])
    const res = await instance.withdraw(accounts[0], value)

    assert.equal(res.logs.length, 1, 'number of events was not 1')
    const event = res.logs[0]
    assert.equal(event.event, 'Withdraw', 'event was not "Withdraw"')
    assert.equal(event.args.to, web3.eth.defaultAccount, 'event argument "to" incorrect')
    assert(event.args.value.equals(value), 'event argument "value" incorrect')

    const gas = res.receipt.gasUsed
    const tx = await web3.eth.getTransaction(res.tx)
    const gasPrice = tx.gasPrice
    const newBalance = await web3.eth.getBalance(accounts[0])

    assert(
      oldBalance.plus(value).minus(gasPrice.times(gas)).equals(newBalance),
     'new balance is not correct'
   )
  })
})
