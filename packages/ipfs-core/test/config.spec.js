
/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { Multiaddr } from 'multiaddr'
import { isBrowser, isWebWorker } from 'ipfs-utils/src/env.js'
import createNode from './utils/create-node.js'
import createConfig from 'ipfs-core-config/config'

const { Bootstrap: bootstrapList } = createConfig()

describe('config', function () {
  this.timeout(10 * 1000)

  /** @type {import('ipfs-core-types').IPFS} */
  let ipfs
  /** @type {() => Promise<void>} */
  let cleanup

  before(async () => {
    const res = await createNode({
      config: {
        Bootstrap: bootstrapList
      }
    })
    ipfs = res.ipfs
    cleanup = res.cleanup
  })

  after(() => cleanup())

  it('bootstrap list should contain dialable nodes', async () => {
    const res = await ipfs.bootstrap.list()

    expect(res.Peers).to.not.be.empty()

    const onlyWssOrResolvableAddr = res.Peers.reduce((acc, curr) => {
      if (!acc) {
        return acc
      }

      const ma = new Multiaddr(curr)
      return ma.protos().some(proto => proto.name === 'wss' || proto.resolvable)
    }, true)

    if (isBrowser || isWebWorker) {
      expect(onlyWssOrResolvableAddr).to.be.true()
    } else {
      expect(onlyWssOrResolvableAddr).to.be.false()
    }
  })
})
