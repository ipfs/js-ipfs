'use strict'

var IPFS = require('ipfs-api')

var ipfs = IPFS()

function store () {
  var toStore = document.getElementById('source').value
  ipfs.add(new Buffer(toStore), function (err, res) {
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
  ipfs.cat(hash, {buffer: true}, function (err, res) {
    if (err || !res) {
      return console.error('ipfs cat error', err, res)
    }

    document.getElementById('hash').innerText = hash
    document.getElementById('content').innerText = res.toString()
  })
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('store').onclick = store
})
