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
    console.log(cid.toBaseEncodedString())
    // should print:
    //   zdpuAzZSktMhXjJu5zneSFrg9ue5rLXKAMC9KLigqhQ7Q7vRm
  })
})
