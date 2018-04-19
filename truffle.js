module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
      gas: 1000000,
      gasPrice: 10000000000
    },
    production: {
      host: 'localhost',
      port: 8545,
      network_id: 1,
      gas: 1000000,
      gasPrice: 10000000000
    },
    rinkeby: {
      host: 'localhost',
      port: 8545,
      network_id: 4
    },
    ropsten: {
      host: 'localhost',
      port: 8545,
      network_id: 3,
      gas: 2000000
    }
  }
}
