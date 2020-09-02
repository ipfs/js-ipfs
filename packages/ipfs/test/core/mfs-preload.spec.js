/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const delay = require('delay')
const multihashing = require('multihashing-async')
const { nanoid } = require('nanoid')
const uint8ArrayFromString = require('uint8arrays/from-string')
const CID = require('cids')
const waitFor = require('../utils/wait-for')
const mfsPreload = require('../../src/core/mfs-preload')

const fakeCid = async () => {
  const mh = await multihashing(uint8ArrayFromString(nanoid()), 'sha2-256')
  return new CID(mh)
}

const createMockFilesStat = (cids = []) => {
  let n = 0
  return () => {
    return Promise.resolve({ cid: cids[n++] || 'QmHash' })
  }
}

const createMockPreload = () => {
  const preload = cid => preload.cids.push(cid)
  preload.cids = []
  return preload
}

describe('MFS preload', () => {
  // CIDs returned from our mock files.stat function
  let testCids
  let mockPreload
  let mockFiles

  beforeEach(async () => {
    mockPreload = createMockPreload()

    testCids = {
      initial: await fakeCid(),
      same: await fakeCid(),
      updated: await fakeCid()
    }

    mockFiles = { stat: createMockFilesStat([testCids.initial, testCids.same, testCids.same, testCids.updated]) }
  })

  it('should preload MFS root periodically', async function () {
    this.timeout(80 * 1000)

    // The CIDs we expect to have been preloaded
    const expectedPreloadCids = [testCids.same, testCids.updated]
    const preloader = mfsPreload({ preload: mockPreload, files: mockFiles, options: { enabled: true, interval: 10 } })

    await preloader.start()

    const test = () => {
      // Slice off any extra CIDs it processed
      const cids = mockPreload.cids.slice(0, expectedPreloadCids.length)

      if (cids.length !== expectedPreloadCids.length) {
        return false
      }

      return cids.every((cid, i) => cid.toString() === expectedPreloadCids[i].toString())
    }

    await waitFor(test, { name: 'CIDs to be preloaded' })
    await preloader.stop()
  })

  it('should disable preloading MFS', async () => {
    const preloader = mfsPreload({ preload: mockPreload, files: mockFiles, options: { enabled: false, interval: 10 } })
    await preloader.start()
    await delay(500)
    expect(mockPreload.cids).to.be.empty()
    await preloader.stop()
  })
})
