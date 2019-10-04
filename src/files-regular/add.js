/* eslint-env mocha, browser */
'use strict'

const { fixtures } = require('./utils')
const Readable = require('readable-stream').Readable
const pull = require('pull-stream')
const expectTimeout = require('../utils/expect-timeout')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { supportsFileReader } = require('ipfs-utils/src/supports')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.add', function () {
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

    it('should add a File', function (done) {
      if (supportsFileReader) {
        ipfs.add(new self.File(['should add a File'], 'filename.txt', { type: 'text/plain' }), (err, filesAdded) => {
          expect(err).to.not.exist()
          expect(filesAdded[0].hash).to.be.eq('QmTVfLxf3qXiJgr4KwG6UBckcNvTqBp93Rwy5f7h3mHsVC')
          done()
        })
      } else {
        this.skip('skip in node')
      }
    })

    it('should add a File as tuple', function (done) {
      if (!supportsFileReader) return this.skip('skip in node')

      const tuple = {
        path: 'filename.txt',
        content: new self.File(['should add a File'], 'filename.txt', { type: 'text/plain' })
      }

      ipfs.add(tuple, (err, filesAdded) => {
        expect(err).to.not.exist()
        expect(filesAdded[0].hash).to.be.eq('QmTVfLxf3qXiJgr4KwG6UBckcNvTqBp93Rwy5f7h3mHsVC')
        done()
      })
    })

    it('should add a File as array of tuple', function (done) {
      if (!supportsFileReader) return this.skip('skip in node')

      const tuple = {
        path: 'filename.txt',
        content: new self.File(['should add a File'], 'filename.txt', { type: 'text/plain' })
      }

      ipfs.add([tuple], (err, filesAdded) => {
        expect(err).to.not.exist()
        expect(filesAdded[0].hash).to.be.eq('QmTVfLxf3qXiJgr4KwG6UBckcNvTqBp93Rwy5f7h3mHsVC')
        done()
      })
    })

    it('should add a Buffer', (done) => {
      ipfs.add(fixtures.smallFile.data, (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.have.length(1)
        const file = filesAdded[0]
        expect(file.hash).to.equal(fixtures.smallFile.cid)
        expect(file.path).to.equal(fixtures.smallFile.cid)
        // file.size counts the overhead by IPLD nodes and unixfs protobuf
        expect(file.size).greaterThan(fixtures.smallFile.data.length)
        done()
      })
    })

    it('should add a Buffer (promised)', () => {
      return ipfs.add(fixtures.smallFile.data)
        .then((filesAdded) => {
          const file = filesAdded[0]
          expect(file.hash).to.equal(fixtures.smallFile.cid)
          expect(file.path).to.equal(fixtures.smallFile.cid)
        })
    })

    it('should add a BIG Buffer', (done) => {
      ipfs.add(fixtures.bigFile.data, (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.have.length(1)
        const file = filesAdded[0]
        expect(file.hash).to.equal(fixtures.bigFile.cid)
        expect(file.path).to.equal(fixtures.bigFile.cid)
        // file.size counts the overhead by IPLD nodes and unixfs protobuf
        expect(file.size).greaterThan(fixtures.bigFile.data.length)
        done()
      })
    })

    it('should add a BIG Buffer with progress enabled', (done) => {
      let progCalled = false
      let accumProgress = 0
      function handler (p) {
        progCalled = true
        accumProgress = p
      }

      ipfs.add(fixtures.bigFile.data, { progress: handler }, (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.have.length(1)
        const file = filesAdded[0]
        expect(file.hash).to.equal(fixtures.bigFile.cid)
        expect(file.path).to.equal(fixtures.bigFile.cid)

        expect(progCalled).to.be.true()
        expect(accumProgress).to.equal(fixtures.bigFile.data.length)
        done()
      })
    })

    it('should add a Buffer as tuple', (done) => {
      const tuple = { path: 'testfile.txt', content: fixtures.smallFile.data }

      ipfs.add([
        tuple
      ], (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.have.length(1)
        const file = filesAdded[0]
        expect(file.hash).to.equal(fixtures.smallFile.cid)
        expect(file.path).to.equal('testfile.txt')

        done()
      })
    })

    it('should add a string', (done) => {
      const data = 'a string'
      const expectedCid = 'QmQFRCwEpwQZ5aQMqCsCaFbdjNLLHoyZYDjr92v1F7HeqX'

      ipfs.add(data, (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.be.length(1)
        const { path, size, hash } = filesAdded[0]
        expect(path).to.equal(expectedCid)
        expect(size).to.equal(16)
        expect(hash).to.equal(expectedCid)
        done()
      })
    })

    it('should add a TypedArray', (done) => {
      const data = Uint8Array.from([1, 3, 8])
      const expectedCid = 'QmRyUEkVCuHC8eKNNJS9BDM9jqorUvnQJK1DM81hfngFqd'

      ipfs.add(data, (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.be.length(1)
        const { path, size, hash } = filesAdded[0]
        expect(path).to.equal(expectedCid)
        expect(size).to.equal(11)
        expect(hash).to.equal(expectedCid)
        done()
      })
    })

    it('should add readable stream', (done) => {
      const expectedCid = 'QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS'

      const rs = new Readable()
      rs.push(Buffer.from('some data'))
      rs.push(null)

      ipfs.add(rs, (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.be.length(1)
        const file = filesAdded[0]
        expect(file.path).to.equal(expectedCid)
        expect(file.size).to.equal(17)
        expect(file.hash).to.equal(expectedCid)
        done()
      })
    })

    it('should add array of objects with readable stream content', (done) => {
      const expectedCid = 'QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS'

      const rs = new Readable()
      rs.push(Buffer.from('some data'))
      rs.push(null)

      const tuple = { path: 'data.txt', content: rs }

      ipfs.add([tuple], (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.be.length(1)
        const file = filesAdded[0]
        expect(file.path).to.equal('data.txt')
        expect(file.size).to.equal(17)
        expect(file.hash).to.equal(expectedCid)
        done()
      })
    })

    it('should add pull stream', (done) => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

      ipfs.add(pull.values([Buffer.from('test')]), (err, res) => {
        if (err) return done(err)
        expect(res).to.have.length(1)
        expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
        done()
      })
    })

    it('should add pull stream (promised)', () => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

      return ipfs.add(pull.values([Buffer.from('test')]))
        .then((res) => {
          expect(res).to.have.length(1)
          expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
        })
    })

    it('should add array of objects with pull stream content (promised)', () => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

      return ipfs.add([{ content: pull.values([Buffer.from('test')]) }])
        .then((res) => {
          expect(res).to.have.length(1)
          expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
        })
    })

    it('should add a nested directory as array of tupples', function (done) {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      const emptyDir = (name) => ({ path: `test-folder/${name}` })

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

      ipfs.add(dirs, (err, res) => {
        expect(err).to.not.exist()
        const root = res[res.length - 1]

        expect(root.path).to.equal('test-folder')
        expect(root.hash).to.equal(fixtures.directory.cid)
        done()
      })
    })

    it('should add a nested directory as array of tupples with progress', function (done) {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      const emptyDir = (name) => ({ path: `test-folder/${name}` })

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

      const total = dirs.reduce((i, entry) => {
        return i + (entry.content ? entry.content.length : 0)
      }, 0)

      let progCalled = false
      let accumProgress = 0
      const handler = (p) => {
        progCalled = true
        accumProgress += p
      }

      ipfs.add(dirs, { progress: handler }, (err, filesAdded) => {
        expect(err).to.not.exist()
        const root = filesAdded[filesAdded.length - 1]

        expect(progCalled).to.be.true()
        expect(accumProgress).to.be.at.least(total)
        expect(root.path).to.equal('test-folder')
        expect(root.hash).to.equal(fixtures.directory.cid)
        done()
      })
    })

    it('should add files to a directory non sequentially', function (done) {
      const content = path => ({
        path: `test-dir/${path}`,
        content: fixtures.directory.files[path.split('/').pop()]
      })

      const input = [
        content('a/pp.txt'),
        content('a/holmes.txt'),
        content('b/jungle.txt'),
        content('a/alice.txt')
      ]

      ipfs.add(input, (err, filesAdded) => {
        expect(err).to.not.exist()

        const toPath = ({ path }) => path
        const nonSeqDirFilePaths = input.map(toPath).filter(p => p.includes('/a/'))
        const filesAddedPaths = filesAdded.map(toPath)

        expect(nonSeqDirFilePaths.every(p => filesAddedPaths.includes(p)))
          .to.be.true()

        done()
      })
    })

    it('should fail when passed invalid input', (done) => {
      const nonValid = 138

      ipfs.add(nonValid, (err, result) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should wrap content in a directory', (done) => {
      const data = { path: 'testfile.txt', content: fixtures.smallFile.data }

      ipfs.add(data, { wrapWithDirectory: true }, (err, filesAdded) => {
        expect(err).to.not.exist()
        expect(filesAdded).to.have.length(2)
        const file = filesAdded[0]
        const wrapped = filesAdded[1]
        expect(file.hash).to.equal(fixtures.smallFile.cid)
        expect(file.path).to.equal('testfile.txt')
        expect(wrapped.path).to.equal('')
        done()
      })
    })

    it('should add with only-hash=true (promised)', function () {
      this.slow(10 * 1000)
      const content = String(Math.random() + Date.now())

      return ipfs.add(Buffer.from(content), { onlyHash: true })
        .then(files => {
          expect(files).to.have.length(1)

          // 'ipfs.object.get(<hash>)' should timeout because content wasn't actually added
          return expectTimeout(ipfs.object.get(files[0].hash), 4000)
        })
    })
  })
}
