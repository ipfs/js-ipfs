'use strict'

const concat = require('concat-stream')
const IPFS = require('../../../src/core') // replace this by line below
// var IPFS = require('ipfs')

// Create the IPFS node instance
// for simplicity, we create a new repo everytime the node
// is created, because you can't init already existing repos
const repoPath = String(Math.random())

const node = new IPFS({
  repo: repoPath,
  EXPERIMENTAL: {
    pubsub: false
  }
})

// expose the node to the window, for the fun!
window.ipfs = node

node.init({ emptyRepo: true, bits: 2048 }, function (err) {
  if (err) {
    throw err
  }
  node.load(function (err) {
    if (err) {
      throw err
    }

    node.goOnline(function (err) {
      if (err) {
        throw err
      }
      console.log('IPFS node is ready')
    })
  })
})

function store () {
  var toStore = document.getElementById('source').value

  node.files.add(new Buffer(toStore), function (err, res) {
    if (err || !res) {
      return console.error('ipfs add error', err, res)
    }

    res.forEach(function (file) {
      if (file && file.hash) {
        console.log('successfully stored', file.hash)
        display(file.hash)
      }
    })
  })
}

function display (hash) {
  // buffer: true results in the returned result being a buffer rather than a stream
  node.files.cat(hash, function (err, res) {
    if (err || !res) {
      return console.error('ipfs cat error', err, res)
    }

    document.getElementById('hash').innerText = hash

    res.pipe(concat(function (data) {
      document.getElementById('content').innerText = data
    }))
  })
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('store').onclick = store
})
