/* eslint max-nested-callbacks: ["error", 6] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const hat = require('hat')
const ipfsExec = require('../utils/ipfs-exec')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'js' })

const checkAll = (bits) => string => bits.every(bit => string.includes(bit))

describe('name', () => {
  const passPhrase = hat()
  const pass = '--pass ' + passPhrase
  const name = 'test-key-' + hat()

  let ipfs
  let ipfsd

  let cidAdded
  let nodeId
  let keyId

  before(function (done) {
    this.timeout(80 * 1000)

    df.spawn({
      exec: `./src/cli/bin.js`,
      config: {},
      args: pass.split(' '),
      initOptions: { bits: 512 }
    }, (err, _ipfsd) => {
      expect(err).to.not.exist()

      ipfsd = _ipfsd
      ipfs = ipfsExec(_ipfsd.repoPath)

      ipfs(`${pass} key gen ${name} --type rsa --size 2048`).then((out) => {
        expect(out).to.include(name)

        keyId = out.split(' ')[1]

        ipfs('id').then((res) => {
          const id = JSON.parse(res)

          expect(id).to.have.property('id')
          nodeId = id.id

          ipfs('add src/init-files/init-docs/readme').then((out) => {
            cidAdded = out.split(' ')[1]
            done()
          })
        })
      })
    })
  })

  after(function (done) {
    if (ipfsd) {
      ipfsd.stop(() => done())
    } else {
      done()
    }
  })

  it('should publish correctly when the file was already added', function (done) {
    this.timeout(60 * 1000)

    ipfs(`name publish ${cidAdded}`).then((res) => {
      expect(res).to.exist()
      expect(res).to.satisfy(checkAll([cidAdded, nodeId]))

      done()
    })
  })

  it('should publish and resolve an entry with the default options', function (done) {
    this.timeout(60 * 1000)

    ipfs(`name publish ${cidAdded}`).then((res) => {
      expect(res).to.exist()

      ipfs('name resolve').then((res) => {
        expect(res).to.exist()
        expect(res).to.satisfy(checkAll([cidAdded]))

        done()
      })
    })
  })

  it('should publish correctly when the file was not added but resolve is disabled', function (done) {
    this.timeout(60 * 1000)

    const notAddedCid = 'QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

    ipfs(`name publish ${notAddedCid} --resolve false`).then((res) => {
      expect(res).to.exist()
      expect(res).to.satisfy(checkAll([notAddedCid, nodeId]))

      done()
    })
  })

  it('should not get the entry correctly if its validity time expired', function (done) {
    this.timeout(60 * 1000)

    ipfs(`name publish ${cidAdded} --lifetime 10ns`).then((res) => {
      expect(res).to.exist()

      setTimeout(function () {
        ipfs('name resolve')
          .then((res) => {
            expect(res).to.not.exist()
          })
          .catch((err) => {
            expect(err).to.exist()
            done()
          })
      }, 1)
    })
  })

  it('should publish correctly when a new key is used', function (done) {
    this.timeout(60 * 1000)

    ipfs(`name publish ${cidAdded} --key ${name}`).then((res) => {
      expect(res).to.exist()
      expect(res).to.satisfy(checkAll([cidAdded, keyId]))

      done()
    })
  })

  it('should return the immediate pointing record, unless using the recursive parameter', function (done) {
    this.timeout(60 * 1000)

    ipfs(`name publish ${cidAdded}`).then((res) => {
      expect(res).to.exist()
      expect(res).to.satisfy(checkAll([cidAdded, nodeId]))

      ipfs(`name publish /ipns/${nodeId} --key ${name}`).then((res) => {
        expect(res).to.exist()
        expect(res).to.satisfy(checkAll([nodeId, keyId]))

        ipfs(`name resolve ${keyId}`).then((res) => {
          expect(res).to.exist()
          expect(res).to.satisfy(checkAll([nodeId]))

          done()
        })
      })
    })
  })

  it('should go recursively until finding an ipfs hash', function (done) {
    this.timeout(60 * 1000)

    ipfs(`name publish ${cidAdded}`).then((res) => {
      expect(res).to.exist()
      expect(res).to.satisfy(checkAll([cidAdded, nodeId]))

      ipfs(`name publish /ipns/${nodeId} --key ${name}`).then((res) => {
        expect(res).to.exist()
        expect(res).to.satisfy(checkAll([nodeId, keyId]))

        ipfs(`name resolve ${keyId} --recursive`).then((res) => {
          expect(res).to.exist()
          expect(res).to.satisfy(checkAll([cidAdded]))

          done()
        })
      })
    })
  })
})
