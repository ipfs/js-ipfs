'use strict'

/* eslint-env mocha */

const CID = require('cids')
const { encodeCID, decodeCID } = require('../src/cid')
const { expect } = require('aegir/utils/chai')

describe('cid', function () {
  this.timeout(10 * 1000)

  describe('encodeCID / decodeCID', () => {
    it('should encode CID', () => {
      const { multihash, codec, version } = encodeCID(
        new CID('Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr')
      )
      expect(multihash).to.be.an.instanceof(Uint8Array)
      expect(version).to.be.a('number')
      expect(codec).to.be.a('string')
    })

    it('should decode CID', () => {
      const { multihash, codec, version } = encodeCID(
        new CID('Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr')
      )
      const cid = new CID('Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr')
      const decodecCID = decodeCID({ multihash, codec, version })

      expect(cid.equals(decodecCID)).to.be.true()
    })
  })
})
