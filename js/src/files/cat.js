/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const bs58 = require('bs58')
const parallel = require('async/parallel')
const CID = require('cids')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.cat', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    before((done) => {
      parallel([
        (cb) => ipfs.files.add(fixtures.smallFile.data, cb),
        (cb) => ipfs.files.add(fixtures.bigFile.data, cb)
      ], done)
    })

    it('should cat with a base58 string encoded multihash', (done) => {
      ipfs.files.cat(fixtures.smallFile.cid, (err, data) => {
        expect(err).to.not.exist()
        expect(data.toString()).to.contain('Plz add me!')
        done()
      })
    })

    it('should cat with a base58 string encoded multihash (promised)', () => {
      return ipfs.files.cat(fixtures.smallFile.cid)
        .then((data) => {
          expect(data.toString()).to.contain('Plz add me!')
        })
    })

    it('should cat with a Buffer multihash', (done) => {
      const cid = Buffer.from(bs58.decode(fixtures.smallFile.cid))

      ipfs.files.cat(cid, (err, data) => {
        expect(err).to.not.exist()
        expect(data.toString()).to.contain('Plz add me!')
        done()
      })
    })

    it('should cat with a CID object', (done) => {
      const cid = new CID(fixtures.smallFile.cid)

      ipfs.files.cat(cid, (err, data) => {
        expect(err).to.not.exist()
        expect(data.toString()).to.contain('Plz add me!')
        done()
      })
    })

    it('should cat a BIG file', (done) => {
      ipfs.files.cat(fixtures.bigFile.cid, (err, data) => {
        expect(err).to.not.exist()
        expect(data.length).to.equal(fixtures.bigFile.data.length)
        expect(data).to.eql(fixtures.bigFile.data)
        done()
      })
    })

    it('should cat with IPFS path', (done) => {
      const ipfsPath = '/ipfs/' + fixtures.smallFile.cid

      ipfs.files.cat(ipfsPath, (err, data) => {
        expect(err).to.not.exist()
        expect(data.toString()).to.contain('Plz add me!')
        done()
      })
    })

    it('should cat with IPFS path, nested value', (done) => {
      const file = { path: 'a/testfile.txt', content: fixtures.smallFile.data }

      ipfs.files.add([file], (err, filesAdded) => {
        expect(err).to.not.exist()

        const file = filesAdded.find((f) => f.path === 'a')
        expect(file).to.exist()

        ipfs.files.cat(`/ipfs/${file.hash}/testfile.txt`, (err, data) => {
          expect(err).to.not.exist()
          expect(data.toString()).to.contain('Plz add me!')
          done()
        })
      })
    })

    it('should error on invalid key (promised)', () => {
      const invalidCid = 'somethingNotMultihash'

      return ipfs.files.cat(invalidCid)
        .catch((err) => {
          expect(err).to.exist()

          const errString = err.toString()
          if (errString === 'Error: invalid ipfs ref path') {
            expect(err.toString()).to.contain('Error: invalid ipfs ref path')
          }

          if (errString === 'Error: Invalid Key') {
            expect(err.toString()).to.contain('Error: Invalid Key')
          }
        })
    })

    it('should error on unknown path (promised)', () => {
      return ipfs.files.cat(fixtures.smallFile.cid + '/does-not-exist')
        .catch((err) => {
          expect(err).to.exist()
          expect(err.message).to.oneOf([
            'No such file',
            'no link named "does-not-exist" under Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'])
        })
    })

    it('should error on dir path (promised)', () => {
      const file = { path: 'dir/testfile.txt', content: fixtures.smallFile.data }

      return ipfs.files.add([file])
        .then((filesAdded) => {
          expect(filesAdded.length).to.equal(2)
          const files = filesAdded.filter((file) => file.path === 'dir')
          expect(files.length).to.equal(1)
          const dir = files[0]
          return ipfs.files.cat(dir.hash)
            .catch((err) => {
              expect(err).to.exist()
              expect(err.message).to.contain('this dag node is a directory')
            })
        })
    })

    it('should export a chunk of a file', (done) => {
      const offset = 1
      const length = 3

      ipfs.files.cat(fixtures.smallFile.cid, {
        offset,
        length
      }, (err, data) => {
        expect(err).to.not.exist()
        expect(data.toString()).to.equal('lz ')
        done()
      })
    })
  })
}
