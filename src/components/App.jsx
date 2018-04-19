import createReactClass from 'create-react-class'
import React from 'react'
import {
  Button,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Jumbotron,
  Label,
  Row
} from 'reactstrap'
import {connect} from 'react-redux'
import Spinner from 'react-spinkit'
import contract from 'truffle-contract'
import Web3 from 'web3'
import ZeroClientProvider from 'web3-provider-engine/zero'

import PreIcoJson from '../../build/contracts/PreIco.json'
import config from 'config'
import {
  setEndTime,
  setInitialSupply,
  setInstance,
  setOneXCC,
  setProvider,
  setRemainingSupply,
  setTokenValue
} from '../actions'
import Calculator from './Calculator'
import ContractAddress from './ContractAddress'
import Countdown from './Countdown'
import getBalances from '../getBalances'
import RemainingSupplyBar from './RemainingSupplyBar'
import TokenAssignements from './TokenAssignements'

const App = createReactClass({
  getInitialState: () => ({
    address: null,
    addressValid: true,
    balance: null,
    loading: false,
    remainingSupplyFilter: null,
    tokenValueFilter: null
  }),

  componentDidMount () {
    window.addEventListener('load', async () => {
      const provider = window.web3
        ? window.web3.currentProvider
        : ZeroClientProvider({
          getAccounts: (cb) => cb(null, []),
          rpcUrl: config.remoteNode
        })

      this.props.dispatch(setProvider(provider))
      const web3 = new Web3(provider)

      const PreIco = contract(PreIcoJson)
      PreIco.setProvider(provider)
      const instance = await PreIco.deployed()
      this.props.dispatch(setInstance(instance))
      this.props.dispatch(setEndTime(await instance.endTime.call()))
      this.props.dispatch(setInitialSupply(await instance.initialSupply.call()))
      const decimals = await instance.decimals.call()
      const oneXCC = web3.toBigNumber(10).pow(decimals)
      this.props.dispatch(setOneXCC(oneXCC))

      const PreIcoWeb3 = web3.eth.contract(PreIcoJson.abi)

      // Set token value
      const tokenValueFilter = PreIcoWeb3.at(instance.address).UpdateValue(null, (err, res) => {
        if (err) {
          console.error(err)
          return
        }
        this.props.dispatch(setTokenValue(res.args.newValue))
      })

      this.setState({
        tokenValueFilter
      })

      try {
        this.props.dispatch(setTokenValue(await instance.tokenValue.call()))
      } catch (e) {
        console.error(e)
      }

      // Set remaining supply
      const remainingSupplyFilter = PreIcoWeb3.at(instance.address).AssignToken(null, async (err, res) => {
        if (err) {
          console.error(err)
          return
        }

        const remainingSupply = await instance.remainingSupply.call()
        this.props.dispatch(setRemainingSupply(remainingSupply))
      })

      this.setState({
        remainingSupplyFilter
      })

      try {
        const remainingSupply = await instance.remainingSupply.call()
        this.props.dispatch(setRemainingSupply(remainingSupply))
      } catch (e) {
        console.error(e)
      }
    })
  },

  componentWillUnmount () {
    this.state.remainingSupplyFilter.stopWatching()
    this.state.tokenValueFilter.stopWatching()
  },

  onInput (e) {
    const address = e.target.form.address.value
    const web3 = new Web3()
    if (address === '') {
      this.setState({
        addressValid: true
      })
      return
    }

    if (web3.isAddress(address)) {
      this.setState({
        address,
        addressValid: true
      })
      return
    }

    this.setState({
      address: null,
      addressValid: false
    })
  },

  async submit (e) {
    const web3 = new Web3(this.props.provider)
    e.preventDefault()
    const address = e.target.address.value
    if (!web3.isAddress(address)) {
      return
    }

    this.setState({
      address,
      loading: true
    })

    const instance = this.props.instance
    const decimals = await instance.decimals.call()
    const startBlock = await instance.startBlock.call()
    const balances = await getBalances(instance.address, startBlock, web3)
    const balance = balances[address] === undefined
      ? web3.toBigNumber(0)
      : balances[address].div(web3.toBigNumber(10).pow(decimals))
    this.setState({
      balance,
      loading: false
    })
  },

  render () {
    const {endTime, instance, oneXCC, provider, tokenValue} = this.props
    const {
      address,
      addressValid,
      balance,
      loading
    } = this.state

    if (instance === null) {
      return <Spinner name='double-bounce' />
    }

    const web3 = new Web3(provider)
    const PreIcoWeb3 = web3.eth.contract(PreIcoJson.abi)

    return (
      <Container fluid>
        <Jumbotron>
          <h2 className='text-center'>
            To get XCC tokens send Ethers to
          </h2>
          <h3 className='text-center'>
            <ContractAddress address={instance.address} />
          </h3>
        </Jumbotron>
        <RemainingSupplyBar />
        <Calculator xccInEth={tokenValue} />

        <br />

        <Row>
          <Col md='8' className='mx-auto'>
            <h4 className='text-center'>
              Pre-ICO will end on {(new Date(endTime * 1000)).toLocaleString()}
            </h4>
            <br />
            <h4>
              <Countdown />
            </h4>
          </Col>
        </Row>

        <br />

        <Row>
          <Col md='6' className='mx-auto'>
            <h3 className='text-center'>
              Check your balance
            </h3>
            <Form onSubmit={this.submit}>
              <FormGroup color={!addressValid ? 'danger' : ''}>
                <Label>
                  Input the Ethereum address used to buy the ICO
                </Label>
                <Input name='address'
                  state={!addressValid ? 'danger' : ''}
                  onInput={this.onInput}
                  placeholder='0xabcd...' />
                {
                  !addressValid
                  ? <FormFeedback>Invalid address</FormFeedback>
                  : null
                }
              </FormGroup>
              <Button
                type='submit'
                block
                color='primary'
                disabled={!address || !addressValid}
              >
                Check balance
              </Button>
            </Form>
            { loading
            ? <Spinner name='double-bounce' />
            : (balance
              ? <p>Your balance is: {balance.toFormat()} XCC</p>
              : null
              )
            }
            {
              oneXCC
              ? <TokenAssignements oneXCC={oneXCC}
                preIcoInstance={instance}
                preIcoWeb3={PreIcoWeb3}
                />
              : null
            }
          </Col>
        </Row>
      </Container>
    )
  }
})

const mapStateToProps = state => state

export default connect(mapStateToProps)(App)
