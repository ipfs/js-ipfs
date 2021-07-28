'use strict'

const createNode = require('./create-node')
const path = require('path')
const { CID } = require('multiformats/cid')
const MultihashDigest = require('multiformats/hashes/digest')
const fs = require('fs').promises
const uint8ArrayToString = require('uint8arrays/to-string')
const { convert } = require('ipld-format-to-blockcodec')
const sha3 = require('js-sha3')

async function main () {
  const ipfs = await createNode({
    ipld: {
      codecs: [
        ...Object.values(require('ipld-ethereum')).map(format => convert(format))
      ],
      hashers: [{
        name: 'keccak-256',
        code: 0x1b,
        digest: async (buf) => {
          return MultihashDigest.create(
            0x1b,
            new Uint8Array(sha3.keccak256.arrayBuffer(buf))
          )
        }
      }]
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
