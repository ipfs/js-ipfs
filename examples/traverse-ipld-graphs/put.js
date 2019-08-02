'use strict'

const createNode = require('./create-node')

async function main () {
  const ipfs = await createNode()

  console.log('\nStart of the example:')

  const myData = {
    name: 'David',
    likes: ['js-ipfs', 'icecream', 'steak']
  }

  const cid = await ipfs.dag.put(myData, { format: 'dag-cbor', hashAlg: 'sha2-256' })
  console.log(cid.toString())
  // should print:
  //   bafyreigsccjrxlioppkkzv27se4gxh2aygbxfnsobkaxxqiuni544uk66a
}

main()
