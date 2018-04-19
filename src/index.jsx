import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {createStore} from 'redux'

import './styles'
import App from './components/App'
import reducers from './reducers'

const store = createStore(reducers)

document.addEventListener('DOMContentLoaded', () => {
/*
  const web3 = window.web3
  const PreIco = contract(PreIcoJson)
  PreIco.setProvider(web3.currentProvider)
  const PreIcoWeb3 = web3.eth.contract(PreIcoJson.abi)
*/
  const app = document.getElementById('app')
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    app
  )
})
