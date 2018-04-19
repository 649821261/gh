/* global artifacts, web3 */

const PreIco = artifacts.require('./PreIco.sol')

module.exports = function (deployer) {
  const initialSupply = web3.toBigNumber('3152291576900481844069068')
  const endDate = (new Date(Date.UTC(2017, 11, 1))).getTime() / 1000

  deployer.deploy(PreIco, initialSupply, 0, 0, endDate)
}
