/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const bs58 = require('bs58')
const Readable = require('readable-stream')
const path = require('path')
const fs = require('fs')
const isNode = require('detect-node')
const bl = require('bl')

module.exports = (common) => {
  describe('.files', () => {
    let smallFile
    let bigFile
    let ipfs

    before((done) => {
      smallFile = fs.readFileSync(path.join(__dirname, './data/testfile.txt')
)
      bigFile = fs.readFileSync(path.join(__dirname, './data/15mb.random')
)

      common.setup((err, _ipfs) => {
        expect(err).to.not.exist
        ipfs = _ipfs
        done()
      })
    })

    after((done) => {
      common.teardown(done)
    })

    describe('callback API', (done) => {
      describe('.add', () => {
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
          const file = {
            path: 'testfile.txt',
            content: smallFile
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
          ipfs.files.add(smallFile, (err, res) => {
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
          ipfs.files.add(bigFile, (err, res) => {
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
          if (!isNode) {
            return done()
            // can't run this test cause browserify
            // can't shim readFileSync in runtime
          }
          const base = path.join(__dirname, 'data/test-folder')
          const content = (name) => ({
            path: `test-folder/${name}`,
            content: fs.readFileSync(path.join(base, name))
          })
          const emptyDir = (name) => ({
            path: `test-folder/${name}`
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

        describe('.createAddStream', () => {
          it('stream of valid files and dirs', (done) => {
            if (!isNode) {
              return done()
              // can't run this test cause browserify
              // can't shim readFileSync in runtime
            }

            const base = path.join(__dirname, 'data/test-folder')
            const content = (name) => ({
              path: `test-folder/${name}`,
              content: fs.readFileSync(path.join(base, name))
            })
            const emptyDir = (name) => ({
              path: `test-folder/${name}`
            })

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

            ipfs.files.createAddStream((err, stream) => {
              expect(err).to.not.exist

              stream.on('data', (tuple) => {
                if (tuple.path === 'test-folder') {
                  const mh = bs58.encode(tuple.node.multihash()).toString()
                  expect(mh).to.equal('QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP')
                  expect(tuple.node.links).to.have.length(6)
                }
              })

              stream.on('end', done)

              files.forEach((file) => {
                stream.write(file)
              })

              stream.end()
            })
          })
        })
      })

      describe('.cat', () => {
        it('with a base58 string encoded multihash', (done) => {
          const hash = 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'
          ipfs.cat(hash, (err, stream) => {
            expect(err).to.not.exist
            stream.pipe(bl((err, data) => {
              expect(err).to.not.exist
              expect(data.toString()).to.contain('Check out some of the other files in this directory:')
              done()
            }))
          })
        })

        it('with a multihash', (done) => {
          const mhBuf = new Buffer(bs58.decode('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'))
          ipfs.cat(mhBuf, (err, stream) => {
            expect(err).to.not.exist
            stream.pipe(bl((err, data) => {
              expect(err).to.not.exist
              expect(data.toString()).to.contain('Check out some of the other files in this directory:')
              done()
            }))
          })
        })

        it('streams a large file', (done) => {
          const hash = 'Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq'
          ipfs.cat(hash, (err, stream) => {
            expect(err).to.not.exist
            stream.pipe(bl((err, data) => {
              expect(err).to.not.exist
              expect(data).to.deep.equal(bigFile)
              done()
            }))
          })
        })
      })
    })

    describe('promise API', () => {
      describe('.add', () => {
        it('buffer', () => {
          return ipfs.files.add(smallFile)
            .then((res) => {
              const added = res[0] != null ? res[0] : res
              const mh = bs58.encode(added.node.multihash()).toString()
              expect(mh).to.equal('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
              expect(added.path).to.equal(mh)
              expect(added.node.links).to.have.length(0)
            })
        })
      })

      describe('.cat', () => {
        it('with a bas58 multihash encoded string', () => {
          const hash = 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'

          return ipfs.cat(hash)
            .then((stream) => {
              stream.pipe(bl((err, data) => {
                expect(err).to.not.exist
                expect(data.toString()).to.contain('Check out some of the other files in this directory:')
              }))
            })
        })

        it('errors on invalid key', () => {
          const hash = 'somethingNotMultihash'

          return ipfs.cat(hash)
            .catch((err) => {
              expect(err).to.exist
              const errString = err.toString()
              if (errString === 'Error: invalid ipfs ref path') {
                expect(err.toString()).to.contain('Error: invalid ipfs ref path')
              }
              if (errString === 'Error: Invalid Key') {
                expect(err.toString()).to.contain('Error: Invalid Key')
              }
            })
        })

        it('with a multihash', () => {
          const hash = new Buffer(bs58.decode('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'))
          return ipfs.cat(hash)
            .then((stream) => {
              stream.pipe(bl((err, bldata) => {
                expect(err).to.not.exist
                expect(bldata.toString()).to.contain('Check out some of the other files in this directory:')
              }))
            })
        })
      })
    })
  })
}
