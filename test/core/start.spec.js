/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const { isNode } = require('ipfs-utils/src/env')
const IPFS = require('../../src/core')
const {
  AlreadyStartingError,
  AlreadyStartedError,
  NotInitializedError
} = require('../../src/core/errors')

// This gets replaced by `create-repo-browser.js` in the browser
const createTempRepo = require('../utils/create-repo-nodejs.js')

describe('start', function () {
  if (!isNode) return

  let ipfs
  let repo

  beforeEach(() => {
    repo = createTempRepo()
  })

  afterEach(async () => {
    if (ipfs && ipfs.isOnline()) {
      await ipfs.stop()
    }

    await repo.teardown()
  })

  it('should start successfully', async () => {
    ipfs = await IPFS.create({
      repo,
      init: true,
      start: false,
      silent: true,
      preload: { enabled: false }
    })

    expect(ipfs.isOnline()).to.be.false()
    await ipfs.start()
    expect(ipfs.isOnline()).to.be.true()
  })

  it('should start and stop and start successfully', async () => {
    ipfs = await IPFS.create({
      repo,
      init: true,
      start: false,
      silent: true,
      preload: { enabled: false }
    })

    expect(ipfs.isOnline()).to.be.false()
    await ipfs.start()
    expect(ipfs.isOnline()).to.be.true()
    await ipfs.stop()
    expect(ipfs.isOnline()).to.be.false()
    await ipfs.start()
    expect(ipfs.isOnline()).to.be.true()
  })

  it('should explode when starting a node twice in parallel', async () => {
    ipfs = await IPFS.create({
      repo,
      init: true,
      start: false,
      silent: true,
      preload: { enabled: false }
    })

    let promise

    await expect(() => {
      promise = ipfs.start()
      ipfs.start()
    }).to.throw(AlreadyStartingError)

    // wait for the first start promise to resolve - this is because the second
    // will cause the test to exit before `ipfs.isOnline` returns true, so the
    // node will not be stopped which messes up the rest of the tests
    await promise
  })

  it('should explode when starting a node twice in series', async () => {
    ipfs = await IPFS.create({
      repo,
      init: true,
      start: false,
      silent: true,
      preload: { enabled: false }
    })

    await ipfs.start()
    await expect(ipfs.start()).to.eventually.be.rejectedWith(AlreadyStartedError)
  })

  it('should not start an uninitialised node', async () => {
    ipfs = await IPFS.create({
      repo,
      init: false,
      start: false,
      silent: true,
      preload: { enabled: false }
    })

    await expect(ipfs.start()).to.eventually.be.rejectedWith(NotInitializedError)
  })
})
