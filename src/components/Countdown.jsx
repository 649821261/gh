import createReactClass from 'create-react-class'
import moment from 'moment'
import React from 'react'
import {connect} from 'react-redux'
import Spinner from 'react-spinkit'
import {Col, Row} from 'reactstrap'

const Countdown = createReactClass({
  getInitialState: () => ({
    interval: null,
    secondsRemaining: 0
  }),

  tick () {
    if (this.state.secondsRemaining <= 0) {
      clearInterval(this.state.interval)
      return
    }

    this.setState({
      secondsRemaining: this.state.secondsRemaining - 1
    })
  },

  componentWillReceiveProps ({endTime}) {
    if (endTime === null || endTime === this.props.endTime) {
      return
    }

    this.setState({
      interval: setInterval(this.tick, 1000),
      secondsRemaining: Math.floor(moment(endTime * 1000).diff(moment()) / 1000)
    })
  },

  componentWillUnmount () {
    clearInterval(this.state.interval)
  },

  render () {
    if (this.props.endTime === null) {
      return <Spinner name='double-bounce' />
    }

    const {secondsRemaining} = this.state
    const seconds = secondsRemaining % 60
    const minutesRemaining = Math.floor(secondsRemaining / 60)
    const minutes = minutesRemaining % 60
    const hoursRemaining = Math.floor(minutesRemaining / 60)
    const hours = hoursRemaining % 24
    const days = Math.floor(hoursRemaining / 24)

    return (
      <Row className='countdown'>
        <Col sm='3'>
          <h4 className='days'>Days</h4>
          <p className='daysValue'>{days}</p>
        </Col>

        <Col sm='3'>
          <h4 className='hours'>Hours</h4>
          <p className='hoursValue'>{hours}</p>
        </Col>

        <Col sm='3'>
          <h4 className='minutes'>Minutes</h4>
          <p className='minutesValue'>{minutes}</p>
        </Col>

        <Col sm='3'>
          <h4 className='seconds'>Seconds</h4>
          <p className='secondsValue'>{seconds}</p>
        </Col>
      </Row>
    )
  }
})

export default connect(s => s)(Countdown)
