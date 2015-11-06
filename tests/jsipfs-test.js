process.env.NODE_ENV = 'test'
var test = require('tape')
var ipfsd = require('ipfsd-ctl')
var IPFS = require('../src')

var node
var daemon

test('start disposable deamon', function (t) {
  ipfsd.disposable(function (err, node) {
    t.error(err)
    t.ok(node)
    daemon = node

    node.startDaemon(function (err) {
      t.error(err)
      console.log(node.apiAddr)
      process.env.APIURL = node.apiAddr
      t.end()
    })
  })
})

test('instatiate JS IPFS', function (t) {
  node = new IPFS()
  t.ok(node)
  t.end()
})

// basic commands

test('init', function (t) {
  t.end()
})

test('close disposable daemon', function (t) {
  var stopped
  daemon.stopDaemon(function (err) {
    if (!stopped) {
      stopped = true
      t.error(err)
      t.end()
    }
  })
})
