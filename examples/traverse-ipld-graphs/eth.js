'use strict'

const createNode = require('./create-node')
const path = require('path')
const { CID } = require('multiformats/cid')
const { from } = require('multiformats/hashes/hasher')
const { coerce } = require('multiformats/hashes/bytes')
const fs = require('fs').promises
const uint8ArrayToString = require('uint8arrays/to-string')
const crypto = require('crypto')

const keccak256 = from({
  name: 'keccak-256',
  code: 0x1b,
  encode: (input) => coerce(crypto.createHash('sha1').update(input).digest())
})

async function main () {
  const ipfs = await createNode({
    ipld: {
      formats: [
        ...Object.values(require('ipld-ethereum'))
      ]
    },
    multiformats: {
      hashes: {
        [0x1b]: keccak256
      },
      codecs: {
        'eth-block': 0x90
      }
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
      mhtype: 'keccak-256'
    })

    console.log(cid.toString())
  }

  const block302516 = new CID('z43AaGEywSDX5PUJcrn5GfZmb6FjisJyR7uahhWPk456f7k7LDA')
  const block302517 = new CID('z43AaGF42R2DXsU65bNnHRCypLPr9sg6D7CUws5raiqATVaB1jj')
  let res

  res = await ipfs.dag.get(block302516, { path: 'number' })
  console.log(uint8ArrayToString(res.value, 'base16'))

  res = await ipfs.dag.get(block302517, { path: 'parent/number' })
  console.log(uint8ArrayToString(res.value, 'base16'))
}

main()
