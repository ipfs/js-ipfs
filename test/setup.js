'use strict'

const ipfsAPI = require('../src/index.js')
const apiAddrs = require('./tmp-disposable-nodes-addrs.json')

global.expect = require('chai').expect
global.apiClients = {} // a, b, c
global.isNode = !global.window

function connectNodes (done) {
  const addrs = {}
  let counter = 0
  collectAddr('b', finish)
  collectAddr('c', finish)

  function finish () {
    counter++
    if (counter === 2) {
      dial()
    }
  }

  function collectAddr (key, cb) {
    apiClients[key].id((err, id) => {
      if (err) {
        throw err
      }
      // note to self: HTTP API port !== Node port
      addrs[key] = id.Addresses[0]
      cb()
    })
  }

  function dial () {
    apiClients['a'].swarm.connect(addrs['b'], (err, res) => {
      if (err) {
        throw err
      }
      apiClients['a'].swarm.connect(addrs['c'], err => {
        if (err) {
          throw err
        }
        done()
      })
    })
  }
}

before(function (done) {
  this.timeout(20000)

  Object.keys(apiAddrs).forEach(key => {
    global.apiClients[key] = ipfsAPI(apiAddrs[key])
  })

  connectNodes(done)
})
