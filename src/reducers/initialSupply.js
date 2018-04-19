export default (state = null, action) => {
  switch (action.type) {
    case 'SET_INITIAL_SUPPLY':
      return action.initialSupply
    default:
      return state
  }
}
