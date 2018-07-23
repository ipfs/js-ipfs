/* eslint-env mocha */
'use strict'

const path = require('path')
const expect = require('chai').expect
const isIpfs = require('is-ipfs')

const runOnAndOff = require('../utils/on-and-off')

describe('resolve', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('should resolve an IPFS hash', () => {
    const filePath = path.join(process.cwd(), '/src/init-files/init-docs/readme')
    let hash

    return ipfs(`add ${filePath}`)
      .then((out) => {
        hash = out.split(' ')[1]
        expect(isIpfs.cid(hash)).to.be.true()
        return ipfs(`resolve /ipfs/${hash}`)
      })
      .then((out) => {
        expect(out).to.contain(`/ipfs/${hash}`)
      })
  })

  it('should resolve an IPFS path link', () => {
    const filePath = path.join(process.cwd(), '/src/init-files/init-docs/readme')
    let fileHash, rootHash

    return ipfs(`add ${filePath} --wrap-with-directory`)
      .then((out) => {
        const lines = out.split('\n')

        fileHash = lines[0].split(' ')[1]
        rootHash = lines[1].split(' ')[1]

        expect(isIpfs.cid(fileHash)).to.be.true()
        expect(isIpfs.cid(rootHash)).to.be.true()

        return ipfs(`resolve /ipfs/${rootHash}/readme`)
      })
      .then((out) => {
        expect(out).to.contain(`/ipfs/${fileHash}`)
      })
  })
}))
