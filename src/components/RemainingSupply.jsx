import React from 'react'
import Spinner from 'react-spinkit'

const RemainingSupply = ({oneXCC, remainingSupply}) => (
  oneXCC === null || remainingSupply === null
  ? <Spinner name='double-bounce' />
  : <span>{remainingSupply.div(oneXCC).toFormat()}</span>
)

export default RemainingSupply
