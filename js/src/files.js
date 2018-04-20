/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const loadFixture = require('aegir/fixtures')
const bs58 = require('bs58')
const parallel = require('async/parallel')
const series = require('async/series')
const Readable = require('readable-stream').Readable
const pull = require('pull-stream')
const concat = require('concat-stream')
const through = require('through2')
const path = require('path')
const bl = require('bl')
const isNode = require('detect-node')
const CID = require('cids')

module.exports = (common) => {
  describe('.files', function () {
    this.timeout(40 * 1000)

    let ipfs
    let withGo

    function fixture (path) {
      return loadFixture(path, 'interface-ipfs-core')
    }

    const wrapDirectory = {
      path: 'wrapper/',
      cid: 'QmbzKtHxQXJnWG9VR66TscUfcoK3CV4nceRsCdyAEsEj9A'
    }

    const smallFile = {
      cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
      data: fixture('js/test/fixtures/testfile.txt')
    }

    const bigFile = {
      cid: 'Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq',
      data: fixture('js/test/fixtures/15mb.random')
    }

    const directory = {
      cid: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP',
      files: {
        'pp.txt': fixture('js/test/fixtures/test-folder/pp.txt'),
        'holmes.txt': fixture('js/test/fixtures/test-folder/holmes.txt'),
        'jungle.txt': fixture('js/test/fixtures/test-folder/jungle.txt'),
        'alice.txt': fixture('js/test/fixtures/test-folder/alice.txt'),
        'files/hello.txt': fixture('js/test/fixtures/test-folder/files/hello.txt'),
        'files/ipfs.txt': fixture('js/test/fixtures/test-folder/files/ipfs.txt')
      }
    }

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          node.id((err, id) => {
            expect(err).to.not.exist()
            withGo = id.agentVersion.startsWith('go-ipfs')
            done()
          })
        })
      })
    })

    after((done) => common.teardown(done))

    describe('.add', () => {
      it('a Buffer', (done) => {
        ipfs.files.add(smallFile.data, (err, filesAdded) => {
          expect(err).to.not.exist()

          expect(filesAdded).to.have.length(1)
          const file = filesAdded[0]
          expect(file.hash).to.equal(smallFile.cid)
          expect(file.path).to.equal(smallFile.cid)
          // file.size counts the overhead by IPLD nodes and unixfs protobuf
          expect(file.size).greaterThan(smallFile.data.length)
          done()
        })
      })

      it('a BIG buffer', (done) => {
        ipfs.files.add(bigFile.data, (err, filesAdded) => {
          expect(err).to.not.exist()

          expect(filesAdded).to.have.length(1)
          const file = filesAdded[0]
          expect(file.hash).to.equal(bigFile.cid)
          expect(file.path).to.equal(bigFile.cid)
          // file.size counts the overhead by IPLD nodes and unixfs protobuf
          expect(file.size).greaterThan(bigFile.data.length)
          done()
        })
      })

      it('a BIG buffer with progress enabled', (done) => {
        let progCalled = false
        let accumProgress = 0
        function handler (p) {
          progCalled = true
          accumProgress = p
        }

        ipfs.files.add(bigFile.data, { progress: handler }, (err, filesAdded) => {
          expect(err).to.not.exist()

          expect(filesAdded).to.have.length(1)
          const file = filesAdded[0]
          expect(file.hash).to.equal(bigFile.cid)
          expect(file.path).to.equal(bigFile.cid)

          expect(progCalled).to.be.true()
          expect(accumProgress).to.equal(bigFile.data.length)
          done()
        })
      })

      it('a Buffer as tuple', (done) => {
        const tuple = { path: 'testfile.txt', content: smallFile.data }

        ipfs.files.add([
          tuple
        ], (err, filesAdded) => {
          expect(err).to.not.exist()

          expect(filesAdded).to.have.length(1)
          const file = filesAdded[0]
          expect(file.hash).to.equal(smallFile.cid)
          expect(file.path).to.equal('testfile.txt')

          done()
        })
      })

      it('add by path fails', (done) => {
        const validPath = path.join(process.cwd() + '/package.json')

        ipfs.files.add(validPath, (err, res) => {
          expect(err).to.exist()
          done()
        })
      })

      it('adds from readable stream', (done) => {
        const expectedCid = 'QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS'

        const rs = new Readable()
        rs.push(Buffer.from('some data'))
        rs.push(null)

        ipfs.files.add(rs, (err, filesAdded) => {
          expect(err).to.not.exist()

          expect(filesAdded).to.be.length(1)
          const file = filesAdded[0]
          expect(file.path).to.equal(expectedCid)
          expect(file.size).to.equal(17)
          expect(file.hash).to.equal(expectedCid)
          done()
        })
      })

      it('adds from array of objects with readable stream content', (done) => {
        const expectedCid = 'QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS'

        const rs = new Readable()
        rs.push(Buffer.from('some data'))
        rs.push(null)

        const tuple = { path: 'data.txt', content: rs }

        ipfs.files.add([tuple], (err, filesAdded) => {
          expect(err).to.not.exist()

          expect(filesAdded).to.be.length(1)
          const file = filesAdded[0]
          expect(file.path).to.equal('data.txt')
          expect(file.size).to.equal(17)
          expect(file.hash).to.equal(expectedCid)
          done()
        })
      })

      it('adds from pull stream (callback)', (done) => {
        const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

        ipfs.files.add(pull.values([Buffer.from('test')]), (err, res) => {
          if (err) return done(err)
          expect(res).to.have.length(1)
          expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
          done()
        })
      })

      it('adds from pull stream (promise)', () => {
        const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

        return ipfs.files.add(pull.values([Buffer.from('test')]))
          .then((res) => {
            expect(res).to.have.length(1)
            expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
          })
      })

      it('adds from array of objects with pull stream content', () => {
        const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

        return ipfs.files.add([{ content: pull.values([Buffer.from('test')]) }])
          .then((res) => {
            expect(res).to.have.length(1)
            expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
          })
      })

      it('add a nested directory as array of tupples', function (done) {
        // TODO: https://github.com/ipfs/js-ipfs-api/issues/339
        if (!isNode) { this.skip() }

        const content = (name) => ({
          path: `test-folder/${name}`,
          content: directory.files[name]
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

        ipfs.files.add(dirs, (err, res) => {
          expect(err).to.not.exist()
          const root = res[res.length - 1]

          expect(root.path).to.equal('test-folder')
          expect(root.hash).to.equal(directory.cid)
          done()
        })
      })

      it('add a nested directory as array of tuppled with progress', function (done) {
        // TODO: https://github.com/ipfs/js-ipfs-api/issues/339
        if (!isNode) { this.skip() }

        const content = (name) => ({
          path: `test-folder/${name}`,
          content: directory.files[name]
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

        ipfs.files.add(dirs, { progress: handler }, (err, filesAdded) => {
          expect(err).to.not.exist()
          const root = filesAdded[filesAdded.length - 1]

          expect(progCalled).to.be.true()
          expect(accumProgress).to.be.at.least(total)
          expect(root.path).to.equal('test-folder')
          expect(root.hash).to.equal(directory.cid)
          done()
        })
      })

      it('fails in invalid input', (done) => {
        const nonValid = 'sfdasfasfs'

        ipfs.files.add(nonValid, (err, result) => {
          expect(err).to.exist()
          done()
        })
      })

      it('wrapWithDirectory', (done) => {
        return ipfs.files.add({ path: 'testfile.txt', content: smallFile.data }, { wrapWithDirectory: true }, (err, filesAdded) => {
          expect(err).to.not.exist()
          expect(filesAdded).to.have.length(2)
          const file = filesAdded[0]
          const wrapped = filesAdded[1]
          expect(file.hash).to.equal(smallFile.cid)
          expect(file.path).to.equal('testfile.txt')
          expect(wrapped.path).to.equal('')
          done()
        })
      })

      it('Promise test', () => {
        return ipfs.files.add(smallFile.data)
          .then((filesAdded) => {
            const file = filesAdded[0]
            expect(file.hash).to.equal(smallFile.cid)
            expect(file.path).to.equal(smallFile.cid)
          })
      })
    })

    describe('.addReadableStream', () => {
      it('stream of valid files and dirs', function (done) {
        // TODO: https://github.com/ipfs/js-ipfs-api/issues/339
        if (!isNode) { this.skip() }

        const content = (name) => ({
          path: `test-folder/${name}`,
          content: directory.files[name]
        })

        const emptyDir = (name) => ({ path: `test-folder/${name}` })

        const files = [
          content('pp.txt'),
          content('holmes.txt'),
          content('jungle.txt'),
          content('alice.txt'),
          emptyDir('empty-folder'),
          content('files/hello.txt'),
          content('files/ipfs.txt'),
          emptyDir('files/empty')
        ]

        const stream = ipfs.files.addReadableStream()

        stream.on('error', (err) => {
          expect(err).to.not.exist()
        })

        stream.on('data', (file) => {
          if (file.path === 'test-folder') {
            expect(file.hash).to.equal(directory.cid)
            done()
          }
        })

        files.forEach((file) => stream.write(file))
        stream.end()
      })
    })

    describe('.addPullStream', () => {
      it('stream of valid files and dirs', function (done) {
        // TODO: https://github.com/ipfs/js-ipfs-api/issues/339
        if (!isNode) { this.skip() }

        const content = (name) => ({
          path: `test-folder/${name}`,
          content: directory.files[name]
        })

        const emptyDir = (name) => ({ path: `test-folder/${name}` })

        const files = [
          content('pp.txt'),
          content('holmes.txt'),
          content('jungle.txt'),
          content('alice.txt'),
          emptyDir('empty-folder'),
          content('files/hello.txt'),
          content('files/ipfs.txt'),
          emptyDir('files/empty')
        ]

        const stream = ipfs.files.addPullStream()

        pull(
          pull.values(files),
          stream,
          pull.collect((err, filesAdded) => {
            expect(err).to.not.exist()

            filesAdded.forEach((file) => {
              if (file.path === 'test-folder') {
                expect(file.hash).to.equal(directory.cid)
                done()
              }
            })
          })
        )
      })

      it('adds with object chunks and pull stream content', (done) => {
        const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

        pull(
          pull.values([{ content: pull.values([Buffer.from('test')]) }]),
          ipfs.files.addPullStream(),
          pull.collect((err, res) => {
            if (err) return done(err)
            expect(res).to.have.length(1)
            expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
            done()
          })
        )
      })
    })

    describe('.cat', () => {
      before((done) => {
        parallel([
          (cb) => ipfs.files.add(smallFile.data, cb),
          (cb) => ipfs.files.add(bigFile.data, cb)
        ], done)
      })

      it('with a base58 string encoded multihash', (done) => {
        ipfs.files.cat(smallFile.cid, (err, data) => {
          expect(err).to.not.exist()
          expect(data.toString()).to.contain('Plz add me!')
          done()
        })
      })

      it('with a multihash', (done) => {
        const cid = Buffer.from(bs58.decode(smallFile.cid))

        ipfs.files.cat(cid, (err, data) => {
          expect(err).to.not.exist()
          expect(data.toString()).to.contain('Plz add me!')
          done()
        })
      })

      it('with a cid object', (done) => {
        const cid = new CID(smallFile.cid)

        ipfs.files.cat(cid, (err, data) => {
          expect(err).to.not.exist()
          expect(data.toString()).to.contain('Plz add me!')
          done()
        })
      })

      it('streams a large file', (done) => {
        ipfs.files.cat(bigFile.cid, (err, data) => {
          expect(err).to.not.exist()
          expect(data.length).to.equal(bigFile.data.length)
          expect(data).to.eql(bigFile.data)
          done()
        })
      })

      it('with ipfs path', (done) => {
        const ipfsPath = '/ipfs/' + smallFile.cid

        ipfs.files.cat(ipfsPath, (err, data) => {
          expect(err).to.not.exist()
          expect(data.toString()).to.contain('Plz add me!')
          done()
        })
      })

      it('with ipfs path, nested value', (done) => {
        const file = { path: 'a/testfile.txt', content: smallFile.data }

        ipfs.files.add([file], (err, filesAdded) => {
          expect(err).to.not.exist()

          filesAdded.forEach((file) => {
            if (file.path === 'a') {
              ipfs.files.cat(`/ipfs/${file.hash}/testfile.txt`, (err, data) => {
                expect(err).to.not.exist()
                expect(data.toString()).to.contain('Plz add me!')
                done()
              })
            }
          })
        })
      })

      it('Promise test', () => {
        return ipfs.files.cat(smallFile.cid)
          .then((data) => {
            expect(data.toString()).to.contain('Plz add me!')
          })
      })

      it('errors on invalid key', () => {
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

      it('errors on unknown path', () => {
        return ipfs.files.cat(smallFile.cid + '/does-not-exist')
          .catch((err) => {
            expect(err).to.exist()
            expect(err.message).to.oneOf([
              'No such file',
              'no link named "does-not-exist" under Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'])
          })
      })

      it('errors on dir path', () => {
        const file = { path: 'dir/testfile.txt', content: smallFile.data }

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

      it('exports a chunk of a file', (done) => {
        if (withGo) { this.skip() }

        const offset = 1
        const length = 3

        ipfs.files.cat(smallFile.cid, {
          offset,
          length
        }, (err, data) => {
          expect(err).to.not.exist()
          expect(data.toString()).to.equal('lz ')
          done()
        })
      })
    })

    describe('.catReadableStream', () => {
      before((done) => ipfs.files.add(bigFile.data, done))

      it('returns a Readable Stream for a cid', (done) => {
        const stream = ipfs.files.catReadableStream(bigFile.cid)

        stream.pipe(bl((err, data) => {
          expect(err).to.not.exist()
          expect(data).to.eql(bigFile.data)
          done()
        }))
      })

      it('exports a chunk of a file in a ReadableStream', (done) => {
        if (withGo) { this.skip() }

        const offset = 1
        const length = 3

        const stream = ipfs.files.catReadableStream(smallFile.cid, {
          offset,
          length
        })

        stream.pipe(bl((err, data) => {
          expect(err).to.not.exist()
          expect(data.toString()).to.equal('lz ')
          done()
        }))
      })
    })

    describe('.catPullStream', () => {
      before((done) => ipfs.files.add(smallFile.data, done))

      it('returns a Pull Stream for a cid', (done) => {
        const stream = ipfs.files.catPullStream(smallFile.cid)

        pull(
          stream,
          pull.concat((err, data) => {
            expect(err).to.not.exist()
            expect(data.length).to.equal(smallFile.data.length)
            expect(data).to.eql(smallFile.data.toString())
            done()
          })
        )
      })

      it('exports a chunk of a file in a PullStream', (done) => {
        if (withGo) { this.skip() }

        const offset = 1
        const length = 3

        const stream = ipfs.files.catPullStream(smallFile.cid, {
          offset,
          length
        })

        pull(
          stream,
          pull.concat((err, data) => {
            expect(err).to.not.exist()
            expect(data.toString()).to.equal('lz ')
            done()
          })
        )
      })
    })

    describe('.get', () => {
      before((done) => {
        parallel([
          (cb) => ipfs.files.add(smallFile.data, cb),
          (cb) => ipfs.files.add(bigFile.data, cb)
        ], done)
      })

      it('with a base58 encoded multihash', (done) => {
        ipfs.files.get(smallFile.cid, (err, files) => {
          expect(err).to.not.exist()

          expect(files).to.be.length(1)
          expect(files[0].path).to.eql(smallFile.cid)
          expect(files[0].content.toString('utf8')).to.contain('Plz add me!')
          done()
        })
      })

      it('with a multihash', (done) => {
        const cidBuf = Buffer.from(bs58.decode(smallFile.cid))
        ipfs.files.get(cidBuf, (err, files) => {
          expect(err).to.not.exist()

          expect(files).to.be.length(1)
          expect(files[0].path).to.eql(smallFile.cid)
          expect(files[0].content.toString('utf8')).to.contain('Plz add me!')
          done()
        })
      })

      it('large file', (done) => {
        ipfs.files.get(bigFile.cid, (err, files) => {
          expect(err).to.not.exist()

          expect(files.length).to.equal(1)
          expect(files[0].path).to.equal(bigFile.cid)
          expect(files[0].content.length).to.eql(bigFile.data.length)
          expect(files[0].content).to.eql(bigFile.data)
          done()
        })
      })

      it('directory', function (done) {
        // TODO: https://github.com/ipfs/js-ipfs-api/issues/339
        if (!isNode) { this.skip() }

        series([
          (cb) => {
            const content = (name) => ({
              path: `test-folder/${name}`,
              content: directory.files[name]
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

            ipfs.files.add(dirs, (err, res) => {
              expect(err).to.not.exist()
              const root = res[res.length - 1]

              expect(root.path).to.equal('test-folder')
              expect(root.hash).to.equal(directory.cid)
              cb()
            })
          },
          (cb) => {
            ipfs.files.get(directory.cid, (err, files) => {
              expect(err).to.not.exist()

              files = files.sort((a, b) => {
                if (a.path > b.path) return 1
                if (a.path < b.path) return -1
                return 0
              })

              // Check paths
              const paths = files.map((file) => { return file.path })
              expect(paths).to.include.members([
                'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP',
                'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/alice.txt',
                'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/empty-folder',
                'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files',
                'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files/empty',
                'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files/hello.txt',
                'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files/ipfs.txt',
                'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/holmes.txt',
                'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/jungle.txt',
                'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/pp.txt'
              ])

              // Check contents
              const contents = files.map((file) => {
                return file.content
                  ? file.content.toString()
                  : null
              })

              expect(contents).to.include.members([
                directory.files['alice.txt'].toString(),
                directory.files['files/hello.txt'].toString(),
                directory.files['files/ipfs.txt'].toString(),
                directory.files['holmes.txt'].toString(),
                directory.files['jungle.txt'].toString(),
                directory.files['pp.txt'].toString()
              ])
              cb()
            })
          }
        ], done)
      })

      it('with ipfs path, as object and nested value', (done) => {
        const file = {
          path: 'a/testfile.txt',
          content: smallFile.data
        }

        ipfs.files.add(file, (err, filesAdded) => {
          expect(err).to.not.exist()

          filesAdded.forEach((file) => {
            if (file.path === 'a') {
              ipfs.files.get(`/ipfs/${file.hash}/testfile.txt`, (err, files) => {
                expect(err).to.not.exist()
                expect(files).to.be.length(1)
                expect(files[0].content.toString('utf8')).to.contain('Plz add me!')
                done()
              })
            }
          })
        })
      })

      it('with ipfs path, as array and nested value', (done) => {
        const file = {
          path: 'a/testfile.txt',
          content: smallFile.data
        }

        ipfs.files.add([file], (err, filesAdded) => {
          expect(err).to.not.exist()

          filesAdded.forEach((file) => {
            if (file.path === 'a') {
              ipfs.files.get(`/ipfs/${file.hash}/testfile.txt`, (err, files) => {
                expect(err).to.not.exist()
                expect(files).to.be.length(1)
                expect(files[0].content.toString('utf8')).to.contain('Plz add me!')
                done()
              })
            }
          })
        })
      })

      it('Promise test', () => {
        return ipfs.files.get(smallFile.cid)
          .then((files) => {
            expect(files).to.be.length(1)
            expect(files[0].path).to.equal(smallFile.cid)
            expect(files[0].content.toString()).to.contain('Plz add me!')
          })
      })

      it('errors on invalid key', () => {
        const invalidCid = 'somethingNotMultihash'

        return ipfs.files.get(invalidCid)
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
    })

    describe('.getReadableStream', () => {
      before((done) => ipfs.files.add(smallFile.data, done))

      it('returns a Readable Stream of Readable Streams', (done) => {
        const stream = ipfs.files.getReadableStream(smallFile.cid)

        let files = []
        stream.pipe(through.obj((file, enc, next) => {
          file.content.pipe(concat((content) => {
            files.push({ path: file.path, content: content })
            next()
          }))
        }, () => {
          expect(files).to.be.length(1)
          expect(files[0].path).to.eql(smallFile.cid)
          expect(files[0].content.toString()).to.contain('Plz add me!')
          done()
        }))
      })
    })

    describe('.getPullStream', () => {
      before((done) => ipfs.files.add(smallFile.data, done))

      it('returns a Pull Stream of Pull Streams', (done) => {
        const stream = ipfs.files.getPullStream(smallFile.cid)

        pull(
          stream,
          pull.collect((err, files) => {
            expect(err).to.not.exist()
            expect(files).to.be.length(1)
            expect(files[0].path).to.eql(smallFile.cid)
            pull(
              files[0].content,
              pull.concat((err, data) => {
                expect(err).to.not.exist()
                expect(data.toString()).to.contain('Plz add me!')
                done()
              })
            )
          })
        )
      })
    })

    describe('.ls', () => {
      before(function (done) {
        // TODO: https://github.com/ipfs/js-ipfs-api/issues/339
        if (!isNode) { this.skip() }

        const content = (name) => ({
          path: `test-folder/${name}`,
          content: directory.files[name]
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

        ipfs.files.add(dirs, (err, res) => {
          expect(err).to.not.exist()
          const root = res[res.length - 1]

          expect(root.path).to.equal('test-folder')
          expect(root.hash).to.equal(directory.cid)
          done()
        })
      })

      it('with a base58 encoded CID', function (done) {
        // TODO: https://github.com/ipfs/js-ipfs-api/issues/339
        if (!isNode) { this.skip() }

        const cid = 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP'
        ipfs.ls(cid, (err, files) => {
          expect(err).to.not.exist()

          expect(files).to.eql([
            { depth: 1,
              name: 'alice.txt',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/alice.txt',
              size: 11696,
              hash: 'QmZyUEQVuRK3XV7L9Dk26pg6RVSgaYkiSTEdnT2kZZdwoi',
              type: 'file' },
            { depth: 1,
              name: 'empty-folder',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/empty-folder',
              size: 4,
              hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
              type: 'dir' },
            { depth: 1,
              name: 'files',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files',
              size: 183,
              hash: 'QmZ25UfTqXGz9RsEJFg7HUAuBcmfx5dQZDXQd2QEZ8Kj74',
              type: 'dir' },
            { depth: 1,
              name: 'holmes.txt',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/holmes.txt',
              size: 582072,
              hash: 'QmR4nFjTu18TyANgC65ArNWp5Yaab1gPzQ4D8zp7Kx3vhr',
              type: 'file' },
            { depth: 1,
              name: 'jungle.txt',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/jungle.txt',
              size: 2305,
              hash: 'QmT6orWioMiSqXXPGsUi71CKRRUmJ8YkuueV2DPV34E9y9',
              type: 'file' },
            { depth: 1,
              name: 'pp.txt',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/pp.txt',
              size: 4551,
              hash: 'QmVwdDCY4SPGVFnNCiZnX5CtzwWDn6kAM98JXzKxE3kCmn',
              type: 'file' }
          ])
          done()
        })
      })

      it('should correctly handle a non existing hash', (done) => {
        ipfs.ls('surelynotavalidhashheh?', (err, res) => {
          expect(err).to.exist()
          expect(res).to.not.exist()
          done()
        })
      })

      it('should correctly handle a non exiting path', (done) => {
        ipfs.ls('QmRNjDeKStKGTQXnJ2NFqeQ9oW/folder_that_isnt_there', (err, res) => {
          expect(err).to.exist()
          expect(res).to.not.exist()
          done()
        })
      })
    })

    describe('.lsReadableStream', () => {
      before(function (done) {
        // TODO: https://github.com/ipfs/js-ipfs-api/issues/339
        if (!isNode) { this.skip() }

        const content = (name) => ({
          path: `test-folder/${name}`,
          content: directory.files[name]
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

        ipfs.files.add(dirs, (err, res) => {
          expect(err).to.not.exist()
          const root = res[res.length - 1]

          expect(root.path).to.equal('test-folder')
          expect(root.hash).to.equal(directory.cid)
          done()
        })
      })

      it('with a base58 encoded CID', function (done) {
        // TODO: https://github.com/ipfs/js-ipfs-api/issues/339
        if (!isNode) { this.skip() }

        const cid = 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP'
        const stream = ipfs.lsReadableStream(cid)

        stream.pipe(concat((files) => {
          expect(files).to.eql([
            { depth: 1,
              name: 'alice.txt',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/alice.txt',
              size: 11696,
              hash: 'QmZyUEQVuRK3XV7L9Dk26pg6RVSgaYkiSTEdnT2kZZdwoi',
              type: 'file' },
            { depth: 1,
              name: 'empty-folder',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/empty-folder',
              size: 4,
              hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
              type: 'dir' },
            { depth: 1,
              name: 'files',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files',
              size: 183,
              hash: 'QmZ25UfTqXGz9RsEJFg7HUAuBcmfx5dQZDXQd2QEZ8Kj74',
              type: 'dir' },
            { depth: 1,
              name: 'holmes.txt',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/holmes.txt',
              size: 582072,
              hash: 'QmR4nFjTu18TyANgC65ArNWp5Yaab1gPzQ4D8zp7Kx3vhr',
              type: 'file' },
            { depth: 1,
              name: 'jungle.txt',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/jungle.txt',
              size: 2305,
              hash: 'QmT6orWioMiSqXXPGsUi71CKRRUmJ8YkuueV2DPV34E9y9',
              type: 'file' },
            { depth: 1,
              name: 'pp.txt',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/pp.txt',
              size: 4551,
              hash: 'QmVwdDCY4SPGVFnNCiZnX5CtzwWDn6kAM98JXzKxE3kCmn',
              type: 'file' }
          ])
          done()
        }))
      })
    })

    describe('.lsPullStream', () => {
      before(function (done) {
        // TODO: https://github.com/ipfs/js-ipfs-api/issues/339
        if (!isNode) { this.skip() }

        const content = (name) => ({
          path: `test-folder/${name}`,
          content: directory.files[name]
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

        ipfs.files.add(dirs, (err, res) => {
          expect(err).to.not.exist()
          const root = res[res.length - 1]

          expect(root.path).to.equal('test-folder')
          expect(root.hash).to.equal(directory.cid)
          done()
        })
      })

      it('with a base58 encoded CID', function (done) {
        // TODO: https://github.com/ipfs/js-ipfs-api/issues/339
        if (!isNode) { this.skip() }

        const cid = 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP'
        const stream = ipfs.lsPullStream(cid)

        pull(
          stream,
          pull.collect((err, files) => {
            expect(err).to.not.exist()

            expect(files).to.eql([
              { depth: 1,
                name: 'alice.txt',
                path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/alice.txt',
                size: 11696,
                hash: 'QmZyUEQVuRK3XV7L9Dk26pg6RVSgaYkiSTEdnT2kZZdwoi',
                type: 'file' },
              { depth: 1,
                name: 'empty-folder',
                path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/empty-folder',
                size: 4,
                hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
                type: 'dir' },
              { depth: 1,
                name: 'files',
                path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files',
                size: 183,
                hash: 'QmZ25UfTqXGz9RsEJFg7HUAuBcmfx5dQZDXQd2QEZ8Kj74',
                type: 'dir' },
              { depth: 1,
                name: 'holmes.txt',
                path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/holmes.txt',
                size: 582072,
                hash: 'QmR4nFjTu18TyANgC65ArNWp5Yaab1gPzQ4D8zp7Kx3vhr',
                type: 'file' },
              { depth: 1,
                name: 'jungle.txt',
                path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/jungle.txt',
                size: 2305,
                hash: 'QmT6orWioMiSqXXPGsUi71CKRRUmJ8YkuueV2DPV34E9y9',
                type: 'file' },
              { depth: 1,
                name: 'pp.txt',
                path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/pp.txt',
                size: 4551,
                hash: 'QmVwdDCY4SPGVFnNCiZnX5CtzwWDn6kAM98JXzKxE3kCmn',
                type: 'file' }
            ])
            done()
          })
        )
      })
    })

    describe('.stat', () => {
      before((done) => ipfs.files.add(smallFile.data, done))

      it('stat outside of mfs', function (done) {
        console.log('Not supported in js-ipfs or go-ipfs yet')
        this.skip()

        ipfs.files.stat('/ipfs/' + smallFile.cid, (err, stat) => {
          expect(err).to.not.exist()
          expect(stat).to.eql({
            type: 'file',
            blocks: 0,
            size: 12,
            hash: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
            cumulativeSize: 20,
            withLocality: false,
            local: undefined,
            sizeLocal: undefined
          })
          done()
        })
      })
    })
  })
}
