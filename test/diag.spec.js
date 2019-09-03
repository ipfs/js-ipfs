/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const platform = require('browser-process-platform')

const ipfsClient = require('../src')
const f = require('./utils/factory')

describe('.diag', function () {
  this.timeout(50 * 1000)

  // go-ipfs does not support these on Windows
  if (platform === 'win32') { return }

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

  describe('api API', () => {
    // Disabled in go-ipfs 0.4.10
    it.skip('.diag.net', async () => {
      const res = await ipfs.diag.net()

      expect(res).to.exist()
    })

    it('.diag.sys', async () => {
      const res = await ipfs.diag.sys()

      expect(res).to.exist()
      expect(res).to.have.a.property('memory')
      expect(res).to.have.a.property('diskinfo')
    })

    it('.diag.cmds', async () => {
      const res = await ipfs.diag.cmds()

      expect(res).to.exist()
    })
  })
})
