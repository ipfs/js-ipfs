'use strict'

const ipfs = require('../src')('localhost', 5001)

const hash = [
  'QmdFyxZXsFiP4csgfM5uPu99AvFiKH62CSPDw5TP92nr7w',
  'QmY9cxiHqTFoWamkQVkpmmqzBrY3hCBEL2XNu3NtX74Fuu'
]

ipfs.cat(hash, function (err, res) {
  if (err || !res) return console.log(err)

  if (res.readable) {
    res.pipe(process.stdout)
  } else {
    console.log(res)
  }
})
