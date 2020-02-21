'use strict'

const ipfs = require('../src')('localhost', 5001)

const f1 = 'Hello'
const f2 = 'World'

ipfs.add([new Buffer(f1), new Buffer(f2)], function (err, res) {
  if (err || !res) return console.log(err)

  for (let i = 0; i < res.length; i++) {
    console.log(res[i])
  }
})

ipfs.add(['./files/hello.txt', './files/ipfs.txt'], function (err, res) {
  if (err || !res) return console.log(err)

  for (let i = 0; i < res.length; i++) {
    console.log(res[i])
  }
})
