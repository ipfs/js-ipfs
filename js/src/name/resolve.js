/* eslint max-nested-callbacks: ["error", 6] */
/* eslint-env mocha */
'use strict'

const hat = require('hat')

const { fixture } = require('./utils')
const { spawnNodeWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.name.resolve', function () {
    const keyName = hat()
    let ipfs
    let nodeId
    let keyId

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodeWithId(factory, (err, node) => {
          expect(err).to.not.exist()

          ipfs = node
          nodeId = node.peerId.id

          ipfs.files.add(fixture.data, { pin: false }, done)
        })
      })
    })

    after((done) => common.teardown(done))

    it('should resolve a record with the default params after a publish', function (done) {
      this.timeout(50 * 1000)

      const value = fixture.cid

      ipfs.name.publish(value, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()

        ipfs.name.resolve(nodeId, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          expect(res.path).to.equal(`/ipfs/${value}`)

          done()
        })
      })
    })

    it('should not get the entry if its validity time expired', function (done) {
      this.timeout(50 * 1000)

      const value = fixture.cid
      const publishOptions = {
        resolve: true,
        lifetime: '1ms',
        ttl: '10s',
        key: 'self'
      }

      ipfs.name.publish(value, publishOptions, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()

        // guarantee that the record has an expired validity.
        setTimeout(function () {
          ipfs.name.resolve(nodeId, (err, res) => {
            expect(err).to.exist()
            expect(err.message).to.equal('record has expired')
            expect(res).to.not.exist()

            done()
          })
        }, 1)
      })
    })

    it('should recursively resolve to an IPFS hash', function (done) {
      this.timeout(100 * 1000)

      const value = fixture.cid
      const publishOptions = {
        resolve: false,
        lifetime: '24h',
        ttl: '10s',
        key: 'self'
      }

      // Generate new key
      ipfs.key.gen(keyName, { type: 'rsa', size: 2048 }, (err, key) => {
        expect(err).to.not.exist()

        keyId = key.id

        // publish ipfs
        ipfs.name.publish(value, publishOptions, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()

          publishOptions.key = keyName

          // publish ipns with the generated key
          ipfs.name.publish(`/ipns/${nodeId}`, publishOptions, (err, res) => {
            expect(err).to.not.exist()
            expect(res).to.exist()

            const resolveOptions = {
              nocache: false,
              recursive: true
            }

            // recursive resolve (will get ipns first, and will resolve again to find the ipfs)
            ipfs.name.resolve(keyId, resolveOptions, (err, res) => {
              expect(err).to.not.exist()
              expect(res).to.exist()
              expect(res.path).to.equal(`/ipfs/${value}`)

              done()
            })
          })
        })
      })
    })
  })
}
