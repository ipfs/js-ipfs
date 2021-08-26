'use strict'

/* eslint-env mocha */

const { CID } = require('multiformats/cid')
const { encodeCID, decodeCID } = require('../src/cid')
const { expect } = require('aegir/utils/chai')

describe('cid', function () {
  this.timeout(10 * 1000)

  describe('encodeCID / decodeCID', () => {
    it('should encode CID', () => {
      const { multihash: { digest }, code, version } = encodeCID(
        CID.parse('Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr')
      )
      expect(digest).to.be.an.instanceof(Uint8Array)
      expect(version).to.be.a('number')
      expect(code).to.be.a('number')
    })

    it('should decode CID', () => {
      const encoded = encodeCID(
        CID.parse('Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr')
      )
      const cid = CID.parse('Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr')
      const decodedCID = decodeCID(encoded)

      expect(cid.equals(decodedCID)).to.be.true()
    })
  })
})
