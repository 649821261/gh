import createReactClass from 'create-react-class'
import React from 'react'
import {connect} from 'react-redux'
import Spinner from 'react-spinkit'
import {Col, Form, FormGroup, Input, Label} from 'reactstrap'
import Web3 from 'web3'

const xccInEur = 0.05

const Calculator = createReactClass({
  getInitialState: () => ({
    eth: (new Web3()).toBigNumber(0),
    eur: (new Web3()).toBigNumber(0),
    xcc: (new Web3()).toBigNumber(0)
  }),

  onChange (e) {
    const name = e.target.name
    const web3 = new Web3()
    let value
    try {
      value = web3.toBigNumber(e.target.value)
    } catch (e) {
      return
    }
    const {xccInEth} = this.props
    const {oneXCC} = this.props

    let xcc

    switch (name) {
      case 'eth':
        xcc = value.times(oneXCC).div(xccInEth)
        this.setState({
          eth: value,
          eur: xcc.times(xccInEur),
          xcc
        })
        break
      case 'eur':
        xcc = value.div(xccInEur)
        this.setState({
          eth: xcc.times(xccInEth).div(oneXCC),
          eur: value,
          xcc
        })
        break
      case 'xcc':
        this.setState({
          eth: value.times(xccInEth).div(oneXCC),
          eur: value.times(xccInEur),
          xcc: value
        })
        break
    }
  },

  render () {
    const {eth, eur, xcc} = this.state

    if (!this.props.oneXCC) {
      return <Spinner name='double-bounce' />
    }

    return (
      <div className='bs-callout bs-callout-info'>
        <h4>
          Token calculator
        </h4>
        <Form className='calculatorForm'>
          <FormGroup row>
            <Col md='4'>
              <Label>
                XCC
              </Label>
              <Input type='number' min='0' name='xcc' value={xcc.toString()} onChange={this.onChange} />
            </Col>

            <Col md='4'>
              <Label>
                ETH
              </Label>
              <Input type='number' min='0' name='eth' value={eth.toString()} onChange={this.onChange} />
            </Col>

            <Col md='4'>
              <Label>
                EUR
              </Label>
              <Input type='number' min='0' name='eur' value={eur.toString()} onChange={this.onChange} />
            </Col>
          </FormGroup>
        </Form>
      </div>
    )
  }
})

export default connect(s => s)(Calculator)
