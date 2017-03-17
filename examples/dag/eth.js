'use strict'

const createNode = require('./create-node.js')
const asyncEach = require('async/each')
const path = require('path')
const multihashing = require('multihashing-async')
const Block = require('ipfs-block')
const CID = require('cids')
const fs = require('fs')

createNode((err, ipfs) => {
  if (err) {
    throw err
  }

  console.log('\nStart of the example:')

  const ethBlocks = [
    path.join(__dirname, '/eth-blocks/block_302516'),
    path.join(__dirname, '/eth-blocks/block_302517')
  ]

  asyncEach(ethBlocks, (ethBlockPath, cb) => {
    const data = fs.readFileSync(ethBlockPath)

    multihashing(data, 'keccak-256', (err, multihash) => {
      if (err) {
        cb(err)
      }
      const cid = new CID(1, 'eth-block', multihash)
      // console.log(cid.toBaseEncodedString())

      ipfs.block.put(new Block(data, cid), cb)
    })
  }, (err) => {
    if (err) {
      throw err
    }

    const block302516 = 'z43AaGEywSDX5PUJcrn5GfZmb6FjisJyR7uahhWPk456f7k7LDA'
    const block302517 = 'z43AaGF42R2DXsU65bNnHRCypLPr9sg6D7CUws5raiqATVaB1jj'

    function errOrLog (err, result) {
      if (err) {
        throw err
      }
      console.log(result.value.toString('hex'))
    }

    ipfs.dag.get(block302516 + '/number', errOrLog)
    ipfs.dag.get(block302517 + '/parent/number', errOrLog)
  })
})
