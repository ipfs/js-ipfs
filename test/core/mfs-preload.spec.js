/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const mfsPreload = require('../../src/core/mfs-preload')

const createMockFilesStat = (cids = []) => {
  let n = 0
  return (path, cb) => cb(null, { hash: cids[n++] || 'QmHash' })
}

const createMockPreload = () => {
  return function preload (cid, cb) {
    preload.cids = preload.cids || []
    preload.cids.push(cid)
    cb()
  }
}

describe('MFS preload', () => {
  it('should preload MFS root periodically', function (done) {
    this.timeout(80 * 1000)

    // CIDs returned from our mock files.stat function
    const statCids = ['QmInitial', 'QmSame', 'QmSame', 'QmUpdated']
    // The CIDs we expect to have been preloaded
    const expectedPreloadCids = ['QmSame', 'QmUpdated']

    const mockPreload = createMockPreload()
    const mockFilesStat = createMockFilesStat(statCids)
    const mockIpfs = { files: { stat: mockFilesStat }, _preload: mockPreload }

    const interval = 10
    const preloader = mfsPreload(mockIpfs, { interval })

    preloader.start((err) => {
      expect(err).to.not.exist()

      setTimeout(() => {
        preloader.stop((err) => {
          expect(err).to.not.exist()
          expect(
            // Slice off any extra CIDs it processed
            mockPreload.cids.slice(0, expectedPreloadCids.length)
          ).to.deep.equal(expectedPreloadCids)
          done()
        })
      }, statCids.length * (interval * 2))
    })
  })
})
