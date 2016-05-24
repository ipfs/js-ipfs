/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const DAGNode = require('ipfs-merkle-dag').DAGNode
const bs58 = require('bs58')
const bl = require('bl')
const Readable = require('readable-stream')
const path = require('path')
const isNode = require('detect-node')

module.exports = (common) => {
  describe('.files/add', () => {
    let testfile
    let testfileBig
    let ipfs

    before((done) => {
      // load test data
      if (isNode) {
        const fs = require('fs')

        const testfilePath = path.join(__dirname, './data/testfile.txt')
        testfile = fs.readFileSync(testfilePath)

        const testfileBigPath = path.join(__dirname, './data/15mb.random')
        testfileBig = fs.createReadStream(testfileBigPath, { bufferSize: 128 })
      } else {
        testfile = require('raw!./data/testfile.txt')
      }

      common.setup((err, _ipfs) => {
        expect(err).to.not.exist
        ipfs = _ipfs
        done()
      })
    })

    after((done) => {
      common.teardown(done)
    })

    it('stream', (done) => {
      const buffered = new Buffer('some data')
      const rs = new Readable()
      rs.push(buffered)
      rs.push(null)

      const arr = []
      const filePair = {path: 'data.txt', content: rs}
      arr.push(filePair)

      ipfs.files.add(arr, (err, res) => {
        expect(err).to.not.exist
        expect(res).to.be.length(1)
        expect(res[0].path).to.equal('data.txt')
        expect(res[0].node.size()).to.equal(17)
        const mh = 'QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS'
        expect(bs58.encode(res[0].node.multihash()).toString()).to.equal(mh)
        done()
      })
    })

    it('buffer as tuple', (done) => {
      if (!isNode) return done()

      const file = {
        path: 'testfile.txt',
        content: new Buffer(testfile)
      }

      ipfs.files.add([file], (err, res) => {
        expect(err).to.not.exist

        const added = res[0] != null ? res[0] : res
        const mh = bs58.encode(added.node.multihash()).toString()
        expect(mh).to.equal('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        expect(added.path).to.equal('testfile.txt')
        expect(added.node.links).to.have.length(0)
        done()
      })
    })

    it('buffer', (done) => {
      let buf = new Buffer(testfile)
      ipfs.files.add(buf, (err, res) => {
        expect(err).to.not.exist

        expect(res).to.have.length(1)
        const mh = bs58.encode(res[0].node.multihash()).toString()
        expect(mh).to.equal('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        expect(res[0].path).to.equal(mh)
        expect(res[0].node.links).to.have.length(0)
        done()
      })
    })

    it('BIG buffer', (done) => {
      if (!isNode) {
        return done()
      }

      ipfs.files.add(testfileBig, (err, res) => {
        expect(err).to.not.exist

        expect(res).to.have.length(1)
        expect(res[0].node.links).to.have.length(58)
        const mh = bs58.encode(res[0].node.multihash()).toString()
        expect(res[0].path).to.equal(mh)
        expect(mh).to.equal('Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq')
        done()
      })
    })

    it('add a nested dir as array', (done) => {
      if (!isNode) return done()
      const fs = require('fs')
      const base = path.join(__dirname, 'data/test-folder')
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fs.readFileSync(path.join(base, name))
      })
      const emptyDir = (name) => ({
        path: `test-folder/${name}`,
        dir: true
      })
      const dirs = [
        content('pp.txt'),
        content('holmes.txt'),
        content('jungle.txt'),
        content('alice.txt'),
        emptyDir('empty-folder'),
        content('files/hello.txt'),
        content('files/ipfs.txt'),
        emptyDir('files/empty')
      ]

      ipfs.files.add(dirs, (err, res) => {
        expect(err).to.not.exist

        const added = res[res.length - 1]
        const mh = bs58.encode(added.node.multihash()).toString()
        expect(mh).to.equal('QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP')
        expect(added.path).to.equal('test-folder')
        expect(added.node.links).to.have.length(6)
        done()
      })
    })

    describe('promise', () => {
      it('buffer', () => {
        let buf = new Buffer(testfile)
        return ipfs.files.add(buf)
          .then((res) => {
            const added = res[0] != null ? res[0] : res
            const mh = bs58.encode(added.node.multihash()).toString()
            expect(mh).to.equal('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
            expect(added.path).to.equal(mh)
            expect(added.node.links).to.have.length(0)
          })
          .catch((err) => {
            expect(err).to.not.exist
          })
      })
    })
  })
}
