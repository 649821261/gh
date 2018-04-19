export default (state = null, action) => {
  switch (action.type) {
    case 'SET_END_TIME':
      return action.endTime
    default:
      return state
  }
}
