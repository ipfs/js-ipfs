'use strict'

const ipfs = require('../src')('localhost', 5001)

const hash = ['QmdbHK6gMiecyjjSoPnfJg6iKMF7v6E2NkoBgGpmyCoevh']

ipfs.ls(hash, function (err, res) {
  if (err || !res) return console.log(err)

  res.Objects.forEach(function (node) {
    console.log(node.Hash)

    console.log('Links [%d]', node.Links.length)
    node.Links.forEach(function (link, i) {
      console.log('[%d]', i, link)
    })
  })
})
