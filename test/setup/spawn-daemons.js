'use strict'
// TODO reduce the callbacks nestness
/* eslint max-nested-callbacks: ["error", 8] */

const gulp = require('gulp')
const fs = require('fs')
const path = require('path')
const ipfsd = require('ipfsd-ctl')
const eachSeries = require('async/eachSeries')
const parallel = require('async/parallel')

let daemons

function startDisposableDaemons (callback) {
  // a, b, c
  const ipfsNodes = {}

  function startIndependentNode (nodes, key, cb) {
    ipfsd.disposable((err, node) => {
      if (err) {
        return cb(err)
      }

      nodes[key] = node

      console.log('  ipfs init done - (bootstrap and mdns off) - ' + key)

      const configValues = {
        Bootstrap: [],
        Discovery: {},
        'API.HTTPHeaders.Access-Control-Allow-Origin': ['*'],
        'API.HTTPHeaders.Access-Control-Allow-Credentials': 'true',
        'API.HTTPHeaders.Access-Control-Allow-Methods': ['PUT', 'POST', 'GET']
      }

      eachSeries(Object.keys(configValues), (configKey, cb) => {
        nodes[key].setConfig(configKey, JSON.stringify(configValues[configKey]), cb)
      }, (err) => {
        if (err) {
          return cb(err)
        }

        nodes[key].startDaemon(cb)
      })
    })
  }

  parallel([
    (cb) => startIndependentNode(ipfsNodes, 'a', cb),
    (cb) => startIndependentNode(ipfsNodes, 'b', cb),
    (cb) => startIndependentNode(ipfsNodes, 'c', cb)
  ], (err) => {
    if (err) {
      return callback(err)
    }
    const targetPath = path.join(__dirname, '/tmp-disposable-nodes-addrs.json')
    fs.writeFileSync(targetPath, JSON.stringify({
      a: ipfsNodes.a.apiAddr,
      b: ipfsNodes.b.apiAddr,
      c: ipfsNodes.c.apiAddr
    }))
    callback(null, ipfsNodes)
  })
}

function stopDisposableDaemons (ds, callback) {
  function stopIPFSNode (node, cb) {
    let nodeStopped
    node.stopDaemon((err) => {
      if (err) {
        return cb(err)
      }
      if (!nodeStopped) {
        nodeStopped = true
        cb()
      }
    })
  }

  parallel([
    (cb) => stopIPFSNode(ds.a, cb),
    (cb) => stopIPFSNode(ds.b, cb),
    (cb) => stopIPFSNode(ds.c, cb)
  ], callback)
}

gulp.task('daemons:start', (done) => {
  startDisposableDaemons((err, d) => {
    if (err) {
      return done(err)
    }
    daemons = d
    done()
  })
})

gulp.task('daemons:stop', (done) => {
  stopDisposableDaemons(daemons, (err) => {
    if (err) {
      return done(err)
    }
    daemons = null
    done()
  })
})
