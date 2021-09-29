/* eslint-env mocha, browser */

import { CID } from 'multiformats/cid'
import { Multiaddr } from 'multiaddr'
import { expect } from 'aegir/utils/chai.js'
import * as IpfsHttpClient from '../src/index.js'

describe('exports', () => {
  it('should export the expected types and utilities', () => {
    expect(IpfsHttpClient.CID).to.equal(CID)
    expect(IpfsHttpClient.multiaddr).to.equal(Multiaddr)
  })
})
