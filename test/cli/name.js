/* eslint max-nested-callbacks: ["error", 5] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const ipfsExec = require('../utils/ipfs-exec')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'js' })

const checkAll = (bits) => string => bits.every(bit => string.includes(bit))

describe.only('name', () => {
  let ipfs
  let cidAdded
  let nodeId

  before(function (done) {
    this.timeout(80 * 1000)

    df.spawn({
      exec: `./src/cli/bin.js`,
      config: {},
      initOptions: { bits: 512 }
    }, (err, node) => {
      expect(err).to.not.exist()
      ipfs = ipfsExec(node.repoPath)

      ipfs('id').then((res) => {
        const id = JSON.parse(res)
        expect(id).to.have.property('id')

        nodeId = id.id

        ipfs('files add src/init-files/init-docs/readme')
          .then((out) => {
            cidAdded = out.split(' ')[1]
            done()
          })
      })
    })
  })

  it('name publish should publish correctly when the file was already added', function () {
    this.timeout(60 * 1000)

    return ipfs(`name publish ${cidAdded}`).then((res) => {
      expect(res).to.exist()
      expect(res).to.satisfy(checkAll([cidAdded, nodeId]))
    })
  })

  /* TODO resolve unexistant file does not resolve error
  it('name publish should return an error when the file was not already added', function () {
    this.timeout(60 * 1000)

    const notAddedCid = 'QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

    return ipfs(`name publish ${notAddedCid}`).then((res) => {
      expect(res).to.exist()
      expect(res).to.satisfy(checkAll([cidAdded, nodeId]))
    })
  }) */

  it('name resolve should get the entry correctly', function () {
    this.timeout(60 * 1000)

    return ipfs(`name publish ${cidAdded}`).then((res) => {
      expect(res).to.exist()
      return ipfs('name resolve').then((res) => {
        expect(res).to.exist()
        expect(res).to.satisfy(checkAll([cidAdded]))
      })
    })
  })
})
