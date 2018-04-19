export default (state = null, action) => {
  switch (action.type) {
    case 'SET_TOKEN_VALUE':
      return action.tokenValue
    default:
      return state
  }
}
