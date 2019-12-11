/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const platform = require('browser-process-platform')
const f = require('./utils/factory')

describe('.diag', function () {
  this.timeout(50 * 1000)

  // go-ipfs does not support these on Windows
  if (platform === 'win32') { return }

  let ipfs

  before(async () => {
    ipfs = (await f.spawn()).api
  })

  after(() => f.clean())

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
