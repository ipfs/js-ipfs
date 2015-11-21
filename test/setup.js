'use strict'

const ipfsAPI = require('../src/index.js')
const apiAddrs = require('./tmp-disposable-nodes-addrs.json')

global.assert = require('assert')
global.apiClients = {} // a, b, c
global.isNode = !global.window

before(function (done) {
  this.timeout(20000)

  Object.keys(apiAddrs).forEach(key => {
    global.apiClients[key] = ipfsAPI(apiAddrs[key])
  })

  done()
})
