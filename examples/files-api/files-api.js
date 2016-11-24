'use strict'

var ipfs = require('../../src')('localhost', 5001)

ipfs.files.ls('/folder1', function (err, res) {
  if (err) {
    return console.log('got an error', err)
  }
  if (res.readable) {
    res.pipe(process.stdout)
  } else {
    console.log(res)
  }
})
