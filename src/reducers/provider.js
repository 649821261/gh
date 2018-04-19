export default (state = null, action) => {
  switch (action.type) {
    case 'SET_PROVIDER':
      return action.provider
    default:
      return state
  }
}
