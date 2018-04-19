export default (state = null, action) => {
  switch (action.type) {
    case 'SET_INSTANCE':
      return action.instance
    default:
      return state
  }
}
