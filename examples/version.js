'use strict'

var ipfs = require('../')('localhost', 5001)

ipfs.commands(function (err, res) {
  if (err) throw err
  console.log(res)
})
