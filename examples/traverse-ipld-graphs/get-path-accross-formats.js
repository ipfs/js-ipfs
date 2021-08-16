'use strict'

const createNode = require('./create-node')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')

async function main () {
  const ipfs = await createNode()

  console.log('\nStart of the example:')

  const someData = uint8ArrayFromString('capoeira')
  const pbNode = {
    Data: someData,
    Links: []
  }

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
    hashAlg: 'sha2-512'
  })

  const result = await ipfs.dag.get(cborNodeCid, {
    path: 'hobbies/0/Data'
  })

  console.log(result.value.toString())
}

main()
