export default (state = null, action) => {
  switch (action.type) {
    case 'SET_REMAINING_SUPPLY':
      return action.remainingSupply
    default:
      return state
  }
}
