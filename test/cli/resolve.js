/* eslint-env mocha */
'use strict'

const path = require('path')
const expect = require('chai').expect
const isIpfs = require('is-ipfs')
const CID = require('cids')

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

  it('should resolve an IPFS hash and print CID encoded in specified base', function () {
    this.timeout(10 * 1000)

    const filePath = path.join(process.cwd(), '/src/init-files/init-docs/readme')
    let b58Hash
    let b64Hash

    return ipfs(`add ${filePath}`)
      .then((out) => {
        b58Hash = out.split(' ')[1]
        expect(isIpfs.cid(b58Hash)).to.be.true()
        b64Hash = new CID(b58Hash).toV1().toBaseEncodedString('base64')
        return ipfs(`resolve /ipfs/${b58Hash} --cid-base=base64`)
      })
      .then((out) => {
        expect(out).to.contain(`/ipfs/${b64Hash}`)
      })
  })

  it('should resolve an IPFS path link', function () {
    this.timeout(10 * 1000)

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
