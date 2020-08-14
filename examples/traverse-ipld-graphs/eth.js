'use strict'

const createNode = require('./create-node')
const path = require('path')
const multihashing = require('multihashing-async')
const Block = require('ipld-block')
const CID = require('cids')
const fs = require('fs').promises
const uint8ArrayToString = require('uint8arrays/to-string')

async function main () {
  const ipfs = await createNode()

  console.log('\nStart of the example:')

  const ethBlocks = [
    path.join(__dirname, '/eth-blocks/block_302516'),
    path.join(__dirname, '/eth-blocks/block_302517')
  ]

  for (const ethBlockPath of ethBlocks) {
    const data = await fs.readFile(ethBlockPath)
    const multihash = await multihashing(data, 'keccak-256')

    const cid = new CID(1, 'eth-block', multihash)
    // console.log(cid.toBaseEncodedString())

    await ipfs.block.put(new Block(data, cid))
  }

  const block302516 = 'z43AaGEywSDX5PUJcrn5GfZmb6FjisJyR7uahhWPk456f7k7LDA'
  const block302517 = 'z43AaGF42R2DXsU65bNnHRCypLPr9sg6D7CUws5raiqATVaB1jj'
  let res

  res = await ipfs.dag.get(block302516 + '/number')
  console.log(uint8ArrayToString(res.value, 'base16'))

  res = await ipfs.dag.get(block302517 + '/parent/number')
  console.log(uint8ArrayToString(res.value, 'base16'))
}

main()
