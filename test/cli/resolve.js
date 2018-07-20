/* eslint-env mocha */
'use strict'

const Path = require('path')
const expect = require('chai').expect
const isIpfs = require('is-ipfs')

const runOnAndOff = require('../utils/on-and-off')

describe('resolve', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('should resolve an IPFS hash', (done) => {
    const path = '/src/init-files/init-docs/readme'
    let hash

    return ipfs(`add ${Path.join(process.cwd(), path)}`)
      .then((out) => {
        hash = out.split(' ')[1]
        console.log(out)
        expect(isIpfs.cid(hash)).to.be.true()
        return ipfs(`resolve ${hash}`)
      })
      .then((out) => {
        expect(out).to.contain(`/ipfs/${hash}`)
      })
  })
}))
