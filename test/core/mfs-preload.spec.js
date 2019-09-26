/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const delay = require('delay')
const waitFor = require('../utils/wait-for')
const mfsPreload = require('../../src/core/mfs-preload')

const createMockFilesStat = (cids = []) => {
  let n = 0
  return () => {
    return Promise.resolve({ hash: cids[n++] || 'QmHash' })
  }
}

const createMockPreload = () => {
  const preload = (cid, cb = () => {}) => {
    preload.cids.push(cid)

    cb()
  }
  preload.cids = []
  return preload
}

describe('MFS preload', () => {
  // CIDs returned from our mock files.stat function
  const statCids = ['QmInitial', 'QmSame', 'QmSame', 'QmUpdated']
  let mockPreload
  let mockFilesStat
  let mockIpfs

  beforeEach(() => {
    mockPreload = createMockPreload()
    mockFilesStat = createMockFilesStat(statCids)
    mockIpfs = {
      files: {
        stat: mockFilesStat
      },
      _preload: mockPreload,
      _options: {
        preload: {
          interval: 10
        }
      }
    }
  })

  it('should preload MFS root periodically', async function () {
    this.timeout(80 * 1000)

    mockIpfs._options.preload.enabled = true

    // The CIDs we expect to have been preloaded
    const expectedPreloadCids = ['QmSame', 'QmUpdated']
    const preloader = mfsPreload(mockIpfs)

    await preloader.start()

    const test = () => {
      // Slice off any extra CIDs it processed
      const cids = mockPreload.cids.slice(0, expectedPreloadCids.length)

      if (cids.length !== expectedPreloadCids.length) {
        return false
      }

      return cids.every((cid, i) => cid === expectedPreloadCids[i])
    }

    await waitFor(test, { name: 'CIDs to be preloaded' })
    await preloader.stop()
  })

  it('should disable preloading MFS', async () => {
    mockIpfs._options.preload.enabled = false

    const preloader = mfsPreload(mockIpfs)
    await preloader.start()
    await delay(500)
    expect(mockPreload.cids).to.be.empty()
    await preloader.stop()
  })
})
