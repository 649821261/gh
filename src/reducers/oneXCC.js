export default (state = null, action) => {
  switch (action.type) {
    case 'SET_ONE_XCC':
      return action.oneXCC
    default:
      return state
  }
}
