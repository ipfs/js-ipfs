'use strict'

const createNode = require('./create-node')
const {
  DAGNode
} = require('ipld-dag-pb')

async function main () {
  const ipfs = await createNode()

  console.log('\nStart of the example:')

  const someData = Buffer.from('capoeira')
  const pbNode = new DAGNode(someData)

  const pbNodeCid = await ipfs.dag.put(pbNode, {
    format: 'dag-pb',
    hashAlg: 'sha2-256'
  })

  const myData = {
    name: 'David',
    likes: ['js-ipfs', 'icecream', 'steak'],
    hobbies: [pbNodeCid]
  }

  const cborNodeCid = await ipfs.dag.put(myData, {
    format: 'dag-cbor',
    hashAlg: 'sha3-512'
  })

  for await (const path of ipfs.dag.tree(cborNodeCid, { recursive: true })) {
    console.log(path)
  }

  await ipfs.stop()
}

main()
