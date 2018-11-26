#!/usr/bin/env node

'use strict'

const ipfs = require('../src')('localhost', 5001)
const files = process.argv.slice(2)

ipfs.add(files, { recursive: true }, function (err, res) {
  if (err || !res) return console.log(err)

  for (let i = 0; i < res.length; i++) {
    console.log('added', res[i].Hash, res[i].Name)
  }
})
