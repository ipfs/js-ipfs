
/* eslint-env mocha */

import { encodeBlock } from '../src/block.js'
import { ipc } from './util.js'
import { expect } from 'aegir/utils/chai.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

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

      const transfer = new Set()

      const blockOut = await move(encodeBlock(blockIn, transfer), transfer)

      expect(blockOut).to.equalBytes(uint8ArrayFromString('hello'))
    })
  })
})
