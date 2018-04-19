import React from 'react'
import {connect} from 'react-redux'
import Spinner from 'react-spinkit'
import {Line} from 'rc-progress'
import Web3 from 'web3'

const RemainingSupplyBar = ({initialSupply, oneXCC, remainingSupply}) => {
  if (initialSupply === null || oneXCC === null || remainingSupply === null) {
    return <Spinner name='double-bounce' />
  }

  const percent = ((new Web3()).toBigNumber(1).minus(remainingSupply.div(initialSupply))).times(100)
  const soldTokens = initialSupply.minus(remainingSupply)
  return (
    <div>
      <h2 className='text-center'>{percent.toNumber()}% tokens sold</h2>
      <Line percent={percent.toNumber()} strokeWidth={4} />
      <h4 className='text-center'>
        {soldTokens.div(oneXCC).toFormat()} / {initialSupply.div(oneXCC).toFormat()}
      </h4>
    </div>
  )
}

export default connect(state => state)(RemainingSupplyBar)
