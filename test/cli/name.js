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
  describe('working locally', () => {
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
        config: {
          Bootstrap: []
        },
        args: ['--pass', passPhrase, '--local'],
        initOptions: { bits: 512 }
      }, (err, _ipfsd) => {
        expect(err).to.not.exist()

        ipfsd = _ipfsd
        ipfs = ipfsExec(_ipfsd.repoPath)

        ipfs(`${pass} key gen ${name} --type rsa --size 2048`)
          .then((out) => {
            expect(out).to.include(name)
            keyId = out.split(' ')[1]

            return ipfs('id')
          })
          .then((res) => {
            const id = JSON.parse(res)
            expect(id).to.have.property('id')
            nodeId = id.id

            return ipfs('add src/init-files/init-docs/readme')
          })
          .then((out) => {
            cidAdded = out.split(' ')[1]
            done()
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

    it('should publish correctly when the file was already added', function () {
      this.timeout(70 * 1000)

      return ipfs(`name publish ${cidAdded}`).then((res) => {
        expect(res).to.exist()
        expect(res).to.satisfy(checkAll([cidAdded, nodeId]))
      })
    })

    it('should publish and resolve an entry with the default options', function () {
      this.timeout(70 * 1000)

      return ipfs(`name publish ${cidAdded}`)
        .then((res) => {
          expect(res).to.exist()

          return ipfs('name resolve')
        })
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.satisfy(checkAll([cidAdded]))
        })
    })

    it('should publish correctly when the file was not added but resolve is disabled', function () {
      this.timeout(70 * 1000)

      const notAddedCid = 'QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

      return ipfs(`name publish ${notAddedCid} --resolve false`).then((res) => {
        expect(res).to.exist()
        expect(res).to.satisfy(checkAll([notAddedCid, nodeId]))
      })
    })

    it('should not get the entry correctly if its validity time expired', function () {
      this.timeout(70 * 1000)

      return ipfs(`name publish ${cidAdded} --lifetime 10ns`)
        .then((res) => {
          expect(res).to.exist()

          setTimeout(function () {
            return ipfs('name resolve')
              .then((res) => {
                expect(res).to.not.exist()
              })
              .catch((err) => {
                expect(err).to.exist()
              })
          }, 1)
        })
    })

    it('should publish correctly when a new key is used', function () {
      this.timeout(70 * 1000)

      return ipfs(`name publish ${cidAdded} --key ${name}`).then((res) => {
        expect(res).to.exist()
        expect(res).to.satisfy(checkAll([cidAdded, keyId]))
      })
    })

    it('should return the immediate pointing record, unless using the recursive parameter', function () {
      this.timeout(90 * 1000)

      return ipfs(`name publish ${cidAdded}`)
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.satisfy(checkAll([cidAdded, nodeId]))

          return ipfs(`name publish /ipns/${nodeId} --key ${name}`)
        })
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.satisfy(checkAll([nodeId, keyId]))

          return ipfs(`name resolve ${keyId}`)
        })
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.satisfy(checkAll([nodeId]))
        })
    })

    it('should go recursively until finding an ipfs hash', function () {
      this.timeout(90 * 1000)

      return ipfs(`name publish ${cidAdded}`)
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.satisfy(checkAll([cidAdded, nodeId]))

          return ipfs(`name publish /ipns/${nodeId} --key ${name}`)
        })
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.satisfy(checkAll([nodeId, keyId]))

          return ipfs(`name resolve ${keyId} --recursive`)
        })
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.satisfy(checkAll([cidAdded]))
        })
    })
  })

  describe.skip('using dht', () => {
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
        config: {
          Bootstrap: [],
          Discovery: {
            MDNS: {
              Enabled: false
            },
            webRTCStar: {
              Enabled: false
            }
          }
        },
        args: ['--pass', passPhrase],
        initOptions: { bits: 512 }
      }, (err, _ipfsd) => {
        expect(err).to.not.exist()

        ipfsd = _ipfsd
        ipfs = ipfsExec(_ipfsd.repoPath)

        ipfs(`${pass} key gen ${name} --type rsa --size 2048`)
          .then((out) => {
            expect(out).to.include(name)
            keyId = out.split(' ')[1]

            return ipfs('id')
          })
          .then((res) => {
            const id = JSON.parse(res)
            expect(id).to.have.property('id')
            nodeId = id.id

            return ipfs('add src/init-files/init-docs/readme')
          })
          .then((out) => {
            cidAdded = out.split(' ')[1]
            done()
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

    it('should publish and resolve an entry with the default options', function () {
      this.timeout(70 * 1000)

      return ipfs(`name publish ${cidAdded}`)
        .then((res) => {
          expect(res).to.exist()

          return ipfs('name resolve')
        })
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.satisfy(checkAll([cidAdded]))
        })
    })

    it('should not get the entry correctly if its validity time expired', function () {
      this.timeout(70 * 1000)

      return ipfs(`name publish ${cidAdded} --lifetime 10ns`)
        .then((res) => {
          expect(res).to.exist()

          setTimeout(function () {
            return ipfs('name resolve')
              .then((res) => {
                expect(res).to.not.exist()
              })
              .catch((err) => {
                expect(err).to.exist()
              })
          }, 1)
        })
    })

    it('should return the immediate pointing record, unless using the recursive parameter', function () {
      this.timeout(90 * 1000)

      return ipfs(`name publish ${cidAdded}`)
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.satisfy(checkAll([cidAdded, nodeId]))

          return ipfs(`name publish /ipns/${nodeId} --key ${name}`)
        })
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.satisfy(checkAll([nodeId, keyId]))

          return ipfs(`name resolve ${keyId}`)
        })
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.satisfy(checkAll([nodeId]))
        })
    })
  })
})
