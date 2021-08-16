/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const delay = require('delay')
const { sha256 } = require('multiformats/hashes/sha2')
const { nanoid } = require('nanoid')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')
const { CID } = require('multiformats/cid')
const waitFor = require('./utils/wait-for')
const mfsPreload = require('../src/mfs-preload')

const fakeCid = async () => {
  const mh = await sha256.digest(uint8ArrayFromString(nanoid()))
  return CID.createV0(mh)
}

/**
 * @param {CID[]} cids
 */
const createMockFilesStat = (cids = []) => {
  let n = 0
  return () => {
    return Promise.resolve({ cid: cids[n++] || 'QmHash' })
  }
}

const createMockPreload = () => {
  /** @type {import('../src/types').Preload & { cids: CID[] }} */
  const preload = cid => preload.cids.push(cid)
  preload.start = () => {}
  preload.stop = () => {}
  preload.cids = []

  return preload
}

describe('MFS preload', () => {
  // CIDs returned from our mock files.stat function
  /** @type {{ initial: CID, same: CID, updated: CID }} */
  let testCids
  /** @type {ReturnType<createMockPreload>} */
  let mockPreload
  /** @type {import('ipfs-core-types/src/files').API} */
  let mockFiles

  beforeEach(async () => {
    mockPreload = createMockPreload()

    testCids = {
      initial: await fakeCid(),
      same: await fakeCid(),
      updated: await fakeCid()
    }

    // @ts-ignore not whole file api
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
