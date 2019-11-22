/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const ipfsClient = require('../src')
const f = require('./utils/factory')

describe('.log', function () {
  this.timeout(100 * 1000)

  let ipfsd
  let ipfs

  before(async () => {
    ipfsd = await f.spawn({
      initOptions: {
        bits: 1024,
        profile: 'test'
      }
    })
    ipfs = ipfsClient(ipfsd.apiAddr)
  })

  after(async () => {
    if (ipfsd) {
      await ipfsd.stop()
    }
  })

  it('.log.tail', async () => {
    const i = setInterval(async () => {
      try {
        await ipfs.add(Buffer.from('just adding some data to generate logs'))
      } catch (_) {
        // this can error if the test has finished and we're shutting down the node
      }
    }, 1000)

    for await (const message of ipfs.log.tail()) {
      clearInterval(i)
      expect(message).to.be.an('object')
      break
    }
  })

  it('.log.ls', async () => {
    const res = await ipfs.log.ls()

    expect(res).to.exist()
    expect(res).to.be.an('array')
  })

  it('.log.level', async () => {
    const res = await ipfs.log.level('all', 'error')

    expect(res).to.exist()
    expect(res).to.be.an('object')
    expect(res).to.not.have.property('error')
    expect(res).to.have.property('message')
  })
})
