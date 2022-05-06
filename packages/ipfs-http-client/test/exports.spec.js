/* eslint-env mocha, browser */

import { CID } from 'multiformats/cid'
import { Multiaddr } from '@multiformats/multiaddr'
import { expect } from 'aegir/chai'
import * as IpfsHttpClient from '../src/index.js'

describe('exports', () => {
  it('should export the expected types and utilities', () => {
    expect(IpfsHttpClient.CID).to.equal(CID)
    expect(IpfsHttpClient.multiaddr).to.equal(Multiaddr)
  })
})
