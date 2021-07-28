'use strict'

/* eslint-env mocha */

const { encodeBlock } = require('../src/block')
const { ipc } = require('./util')
const { expect } = require('aegir/utils/chai')
const { fromString: uint8ArrayFromString } = require('@vascosantos/uint8arrays/from-string')

describe('block (browser)', function () {
  this.timeout(10 * 1000)
  const move = ipc()

  describe('encodeBlock / decodeBlock', () => {
    it('should decode Block over message channel', async () => {
      const blockIn = uint8ArrayFromString('hello')

      const blockOut = await move(encodeBlock(blockIn))

      expect(blockOut).to.be.deep.equal(blockIn)
    })

    it('should decode Block over message channel & transfer bytes', async () => {
      const blockIn = uint8ArrayFromString('hello')

      const transfer = []

      const blockOut = await move(encodeBlock(blockIn, transfer), transfer)

      expect(blockOut).to.equalBytes(uint8ArrayFromString('hello'))
    })
  })
})
