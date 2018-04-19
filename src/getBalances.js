const {abi} = require('../build/contracts/PreIco.json')

const filterGet = (filter) => new Promise((resolve, reject) => {
  filter.get((err, res) => {
    if (err) {
      reject(err)
    } else {
      resolve(res)
    }
  })
})

const assignEvents = async (address, start, web3) => {
  const PreIco = web3.eth.contract(abi)
  const filter = PreIco.at(address).AssignToken(null, {
    fromBlock: start
  })

  return filterGet(filter)
}

const getBalances = async (address, start, web3) => {
  const events = await assignEvents(address, start, web3)
  const balances = await Promise.all(events
    .map(({args}) => args)
  )
  const res = {}
  balances.forEach(({to, value}) => {
    if (res[to] === undefined) {
      res[to] = value
      return
    }
    res[to] = res[to].plus(value)
  })
  return res
}

module.exports = getBalances
