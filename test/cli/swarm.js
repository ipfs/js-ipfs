/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const sinon = require('sinon')
const ipfsExec = require('../utils/ipfs-exec')
const factory = require('../utils/factory')

describe('swarm', () => {
  const df = factory({ type: 'js' })
  afterEach(() => {
    sinon.restore()
  })

  describe('daemon on (through http-api)', function () {
    this.timeout(60 * 1000)

    let bMultiaddr
    let ipfsA

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(80 * 1000)

      const res = await Promise.all([
        df.spawn(),
        df.spawn()
      ])
      ipfsA = ipfsExec(res[0].path)
      const id = await res[1].api.id()
      bMultiaddr = id.addresses[0]
    })

    after(() => df.clean())

    it('connect', async () => {
      const out = await ipfsA(`swarm connect ${bMultiaddr}`)
      expect(out).to.eql(`connect ${bMultiaddr} success\n`)
    })

    it('peers', async () => {
      const out = await ipfsA('swarm peers')
      expect(out).to.eql(bMultiaddr + '\n')
    })

    it('addrs', async () => {
      const out = await ipfsA('swarm addrs')
      expect(out).to.have.length.above(1)
    })

    it('addrs local', async () => {
      const out = await ipfsA('swarm addrs local')
      expect(out).to.have.length.above(1)
    })

    it('disconnect', async () => {
      const out = await ipfsA(`swarm disconnect ${bMultiaddr}`)
      expect(out).to.eql(
        `disconnect ${bMultiaddr} success\n`
      )
    })

    it('`peers` should not throw after `disconnect`', async () => {
      const out = await ipfsA('swarm peers')
      expect(out).to.be.empty()
    })

    // TODO these tests above need to be standalone
  })
})
