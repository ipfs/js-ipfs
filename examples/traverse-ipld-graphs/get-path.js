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
  let result

  result = await ipfs.dag.get(cid, { path: 'name' })
  console.log(result.value)

  result = await ipfs.dag.get(cid, { path: 'likes' })
  console.log(result.value)

  result = await ipfs.dag.get(cid, { path: '/likes/0' })
  console.log(result.value)
}

main()
