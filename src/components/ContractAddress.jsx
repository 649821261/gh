import createReactClass from 'create-react-class'
import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {Tooltip} from 'reactstrap'
import uuid from 'uuid'
import Web3 from 'web3'

const copy = 'Copy address to clipboard'
const copied = 'Copied!'

const ContractAddress = createReactClass({
  getInitialState: () => ({
    id: uuid(),
    tooltipOpen: false,
    toolTipText: copy
  }),

  toggle () {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen,
      toolTipText: copy
    })
  },

  onClick () {
    this.setState({
      tooltipOpen: true,
      toolTipText: copied
    })
  },

  render () {
    const {address} = this.props
    const {id, toolTipText} = this.state
    const web3 = new Web3()
    return (
      <span>
        <CopyToClipboard text={address}>
          <span className='contractAddress' id={id} onClick={this.onClick}>
            {web3.toChecksumAddress(address)}
          </span>
        </CopyToClipboard>
        <Tooltip placement='bottom' isOpen={this.state.tooltipOpen} target={id} toggle={this.toggle}>
          {toolTipText}
        </Tooltip>
      </span>
    )
  }
})

export default ContractAddress
