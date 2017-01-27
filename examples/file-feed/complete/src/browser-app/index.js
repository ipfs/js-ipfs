import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, browserHistory } from 'react-router'
import App from './App'
import './index.css'

const Index = () => (
  <Router history={browserHistory}>
    <Route path='/' component={App} />
    <Route path='/:hash' component={App} />
    <Route path='/open/:file' component={App} />
  </Router>
)

ReactDOM.render(<Index />, document.getElementById('root'))
