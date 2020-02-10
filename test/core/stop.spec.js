/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const { isNode } = require('ipfs-utils/src/env')
const IPFS = require('../../src/core')
const {
  AlreadyStoppingError,
  NotStartedError
} = require('../../src/core/errors')

// This gets replaced by `create-repo-browser.js` in the browser
const createTempRepo = require('../utils/create-repo-nodejs.js')

describe('stop', function () {
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

  it('should stop successfully', async () => {
    ipfs = await IPFS.create({
      repo,
      init: true,
      start: true,
      silent: true,
      preload: { enabled: false }
    })

    expect(ipfs.isOnline()).to.be.true()
    await ipfs.stop()
    expect(ipfs.isOnline()).to.be.false()
  })

  it('should start and stop and start and stop successfully', async () => {
    ipfs = await IPFS.create({
      repo,
      init: true,
      start: true,
      silent: true,
      preload: { enabled: false }
    })

    expect(ipfs.isOnline()).to.be.true()
    await ipfs.stop()
    expect(ipfs.isOnline()).to.be.false()
    await ipfs.start()
    expect(ipfs.isOnline()).to.be.true()
    await ipfs.stop()
    expect(ipfs.isOnline()).to.be.false()
  })

  it('should explode when stopping a node twice in parallel', async () => {
    ipfs = await IPFS.create({
      repo,
      init: true,
      start: true,
      silent: true,
      preload: { enabled: false }
    })

    let promise

    await expect(() => {
      promise = ipfs.stop()
      ipfs.stop()
    }).to.throw(AlreadyStoppingError)

    // wait for the first start promise to resolve - this is because the second
    // will cause the test to exit before `ipfs.isOnline` returns true, so the
    // node will not be stopped which messes up the rest of the tests
    await promise
  })

  it('should explode when starting a node twice in series', async () => {
    ipfs = await IPFS.create({
      repo,
      init: true,
      start: true,
      silent: true,
      preload: { enabled: false }
    })

    await ipfs.stop()
    await expect(ipfs.stop()).to.eventually.be.rejectedWith(NotStartedError)
  })
})
