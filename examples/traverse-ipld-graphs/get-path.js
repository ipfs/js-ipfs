'use strict'

const createNode = require('./create-node.js')

createNode((err, ipfs) => {
  if (err) {
    throw err
  }

  console.log('\nStart of the example:')

  const myData = {
    name: 'David',
    likes: ['js-ipfs', 'icecream', 'steak']
  }

  ipfs.dag.put(myData, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid) => {
    if (err) {
      throw err
    }

    ipfs.dag.get(cid, 'name', (err, result) => {
      if (err) {
        throw err
      }

      console.log(result.value, result.remainderPath)
    })

    ipfs.dag.get(cid, 'likes', (err, result) => {
      if (err) {
        throw err
      }

      console.log(result.value)
    })

    const cidStr = cid.toBaseEncodedString()

    ipfs.dag.get(cidStr + '/likes/0', (err, result) => {
      if (err) {
        throw err
      }

      console.log(result.value)
    })
  })
})
