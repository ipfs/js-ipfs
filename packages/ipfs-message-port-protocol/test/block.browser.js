'use strict'

/* eslint-env mocha */

const CID = require('cids')
const { encodeBlock, decodeBlock } = require('../src/block')
const { ipc } = require('./util')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const { Buffer } = require('buffer')
const Block = require('ipld-block')

describe('block (browser)', function () {
  this.timeout(10 * 1000)
  const move = ipc()

  describe('encodeBlock / decodeBlock', () => {
    it('should decode Block over message channel', async () => {
      const blockIn = new Block(
        Buffer.from('hello'),
        new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
      )

      const blockOut = decodeBlock(await move(encodeBlock(blockIn)))

      expect(blockOut).to.be.deep.equal(blockIn)
    })

    it('should decode Block over message channel & transfer bytes', async () => {
      const cid = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
      const data = Buffer.from('hello')
      const blockIn = new Block(data, cid)

      const transfer = []

      const blockOut = decodeBlock(
        await move(encodeBlock(blockIn, transfer), transfer)
      )

      expect(blockOut).to.be.instanceOf(Block)
      expect(blockOut).to.be.deep.equal(
        new Block(
          Buffer.from('hello'),
          new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
        )
      )

      expect(data).to.have.property('byteLength', 0, 'data was cleared')
      expect(cid.multihash).to.have.property('byteLength', 0, 'cid was cleared')
    })
  })
})
