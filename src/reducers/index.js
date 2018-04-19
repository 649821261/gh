import {combineReducers} from 'redux'

import endTime from './endTime'
import initialSupply from './initialSupply'
import instance from './instance'
import oneXCC from './oneXCC'
import provider from './provider'
import remainingSupply from './remainingSupply'
import tokenValue from './tokenValue'

export default combineReducers({
  endTime,
  initialSupply,
  instance,
  oneXCC,
  provider,
  remainingSupply,
  tokenValue
})
