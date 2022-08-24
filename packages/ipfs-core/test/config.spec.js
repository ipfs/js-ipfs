
/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { Multiaddr } from '@multiformats/multiaddr'
import { isBrowser, isWebWorker } from 'ipfs-utils/src/env.js'
import createNode from './utils/create-node.js'
import createConfig from 'ipfs-core-config/config'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { unmarshalPrivateKey } from '@libp2p/crypto/keys'
import { peerIdFromKeys } from '@libp2p/peer-id'

const { Bootstrap: bootstrapList } = createConfig()

describe('config', function () {
  this.timeout(10 * 1000)

  /** @type {import('ipfs-core-types').IPFS} */
  let ipfs
  /** @type {() => Promise<void>} */
  let cleanup
  /** @type {import("ipfs-repo/dist/src/types").IPFSRepo} */
  let repo

  before(async () => {
    const res = await createNode({
      config: {
        Bootstrap: bootstrapList
      }
    })
    ipfs = res.ipfs
    cleanup = res.cleanup
    repo = res.repo
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
  it('does not store node private key in clear text', async () => {
    const config = await repo.config.getAll()
    const { Identity } = config
    const peerId = await ipfs.id()
    const peerIdString = peerId.id.toString()
    expect(peerIdString).to.equal(Identity?.PeerID)
    const privKey = Identity?.PrivKey || ''
    const buf = uint8ArrayFromString(privKey, 'base64pad')
    const key = await unmarshalPrivateKey(buf)
    const pwntId = await peerIdFromKeys(key.public.bytes, key.bytes)
    expect(peerIdString).not.equal(pwntId.toString())
  })
})
