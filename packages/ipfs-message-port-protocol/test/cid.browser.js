
/* eslint-env mocha */

import { CID } from 'multiformats/cid'
import { encodeCID, decodeCID } from '../src/cid.js'
import { ipc } from './util.js'
import { expect } from 'aegir/utils/chai.js'

describe('cid (browser)', function () {
  this.timeout(10 * 1000)
  const move = ipc()

  describe('encodeCID / decodeCID', () => {
    it('should decode to CID over message channel', async () => {
      const cidIn = CID.parse('Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr')
      const cidDataIn = encodeCID(cidIn)
      const cidDataOut = await move(cidDataIn)
      const cidOut = decodeCID(cidDataOut)

      expect(cidOut).to.be.an.instanceof(CID)
      expect(cidOut.equals(cidIn)).to.be.true()
      expect(cidIn.bytes)
        .property('byteLength')
        .not.be.equal(0)
    })

    it('should decode CID and transfer bytes', async () => {
      const cidIn = CID.parse('Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr')
      const transfer = new Set()
      const cidDataIn = encodeCID(cidIn, transfer)
      const cidDataOut = await move(cidDataIn, transfer)
      const cidOut = decodeCID(cidDataOut)

      expect(cidOut).to.be.an.instanceof(CID)
      expect(cidIn.bytes).property('byteLength', 0)
      expect(cidOut.bytes)
        .property('byteLength')
        .to.not.be.equal(0)
      expect(cidOut.toString()).to.be.equal(
        'Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr'
      )
    })
  })
})
