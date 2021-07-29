'use strict'

const createNode = require('./create-node')
const path = require('path')
const { CID } = require('multiformats/cid')
const fs = require('fs').promises
const { toString: uint8ArrayToString } = require('@vascosantos/uint8arrays/to-string')
const { convert } = require('ipld-format-to-blockcodec')
const { keccak256 } = require('@multiformats/sha3')

async function main () {
  const ipfs = await createNode({
    ipld: {
      codecs: [
        ...Object.values(require('ipld-ethereum')).map(format => convert(format))
      ],
      hashers: [
        keccak256
      ]
    }
  })

  console.log('\nStart of the example:')

  const ethBlocks = [
    path.join(__dirname, '/eth-blocks/block_302516'),
    path.join(__dirname, '/eth-blocks/block_302517')
  ]

  for (const ethBlockPath of ethBlocks) {
    const data = await fs.readFile(ethBlockPath)

    const cid = await ipfs.block.put(data, {
      format: 'eth-block',
      mhtype: 'keccak-256',
      version: 1
    })

    console.log(cid.toString())
  }

  const block302516 = CID.parse('z43AaGEywSDX5PUJcrn5GfZmb6FjisJyR7uahhWPk456f7k7LDA')
  const block302517 = CID.parse('z43AaGF42R2DXsU65bNnHRCypLPr9sg6D7CUws5raiqATVaB1jj')
  let res

  res = await ipfs.dag.get(block302516, { path: 'number' })
  console.log(uint8ArrayToString(res.value, 'base16'))

  res = await ipfs.dag.get(block302517, { path: 'parent/number' })
  console.log(uint8ArrayToString(res.value, 'base16'))

  await ipfs.stop()
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
