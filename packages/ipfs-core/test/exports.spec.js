/* eslint-env mocha */

import crypto from 'libp2p-crypto'
import isIPFS from 'is-ipfs'
import { CID } from 'multiformats/cid'
import { Multiaddr } from 'multiaddr'
import PeerId from 'peer-id'
import { expect } from 'aegir/utils/chai.js'
import * as Ipfs from '../src/index.js'

describe('exports', () => {
  it('should export the expected types and utilities', () => {
    expect(Ipfs.crypto).to.equal(crypto)
    expect(Ipfs.isIPFS).to.equal(isIPFS)
    expect(Ipfs.CID).to.equal(CID)
    expect(Ipfs.multiaddr).to.equal(Multiaddr)
    expect(Ipfs.PeerId).to.equal(PeerId)
  })
})
