/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const expect = require('chai').expect
const bs58 = require('bs58')
const Readable = require('readable-stream')
const path = require('path')
const fs = require('fs')
const bl = require('bl')
const concat = require('concat-stream')
const through = require('through2')

module.exports = (common) => {
  describe.only('.files', () => {
    let smallFile
    let bigFile
    let directoryContent
    let ipfs

    before((done) => {
      smallFile = fs.readFileSync(path.join(__dirname, './data/testfile.txt'))
      bigFile = fs.readFileSync(path.join(__dirname, './data/15mb.random'))
      directoryContent = {
        'pp.txt': fs.readFileSync(path.join(__dirname, './data/test-folder/pp.txt')),
        'holmes.txt': fs.readFileSync(path.join(__dirname, './data/test-folder/holmes.txt')),
        'jungle.txt': fs.readFileSync(path.join(__dirname, './data/test-folder/jungle.txt')),
        'alice.txt': fs.readFileSync(path.join(__dirname, './data/test-folder/alice.txt')),
        'files/hello.txt': fs.readFileSync(path.join(__dirname, './data/test-folder/files/hello.txt')),
        'files/ipfs.txt': fs.readFileSync(path.join(__dirname, './data/test-folder/files/ipfs.txt'))
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
          const content = (name) => ({
            path: `test-folder/${name}`,
            content: directoryContent[name]
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
            const content = (name) => ({
              path: `test-folder/${name}`,
              content: directoryContent[name]
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
        it('with a base58 multihash encoded string', () => {
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
              stream.pipe(bl((err, data) => {
                expect(err).to.not.exist
                expect(data.toString()).to.contain('Check out some of the other files in this directory:')
              }))
            })
        })
      })
    })

    describe('.get', () => {
      it('with a base58 encoded multihash', (done) => {
        const hash = 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'
        ipfs.files.get(hash, (err, stream) => {
          expect(err).to.not.exist
          stream.pipe(concat((files) => {
            expect(err).to.not.exist
            expect(files).to.be.length(1)
            expect(files[0].path).to.equal(hash)
            files[0].content.pipe(concat((content) => {
              expect(content.toString()).to.contain('Check out some of the other files in this directory:')
              done()
            }))
          }))
        })
      })

      it('with a multihash', (done) => {
        const hash = 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'
        const mhBuf = new Buffer(bs58.decode(hash))
        ipfs.files.get(mhBuf, (err, stream) => {
          expect(err).to.not.exist
          stream.pipe(concat((files) => {
            expect(files).to.be.length(1)
            expect(files[0].path).to.deep.equal(hash)
            files[0].content.pipe(concat((content) => {
              expect(content.toString()).to.contain('Check out some of the other files in this directory:')
              done()
            }))
          }))
        })
      })

      it('large file', (done) => {
        const hash = 'Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq'
        ipfs.files.get(hash, (err, stream) => {
          expect(err).to.not.exist

          // accumulate the files and their content
          var files = []
          stream.pipe(through.obj((file, enc, next) => {
            file.content.pipe(concat((content) => {
              files.push({
                path: file.path,
                content: content
              })
              next()
            }))
          }, () => {
            expect(files.length).to.equal(1)
            expect(files[0].path).to.equal(hash)
            expect(files[0].content).to.deep.equal(bigFile)
            done()
          }))
        })
      })

      it('directory', (done) => {
        const hash = 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP'
        ipfs.files.get(hash, (err, stream) => {
          expect(err).to.not.exist

          // accumulate the files and their content
          var files = []
          stream.pipe(through.obj((file, enc, next) => {
            if (file.content) {
              file.content.pipe(concat((content) => {
                files.push({
                  path: file.path,
                  content: content
                })
                next()
              }))
            } else {
              files.push(file)
              next()
            }
          }, () => {
            // Check paths
            var paths = files.map((file) => {
              return file.path
            })
            expect(paths).to.deep.equal([
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
            var contents = files.map((file) => {
              return file.content ? file.content : null
            })
            expect(contents).to.deep.equal([
              null,
              directoryContent['alice.txt'],
              null,
              null,
              null,
              directoryContent['files/hello.txt'],
              directoryContent['files/ipfs.txt'],
              directoryContent['holmes.txt'],
              directoryContent['jungle.txt'],
              directoryContent['pp.txt']
            ])
            done()
          }))
        })
      })

      describe('promise', () => {
        it('with a base58 encoded string', (done) => {
          const hash = 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'
          ipfs.files.get(hash)
            .then((stream) => {
              stream.pipe(concat((files) => {
                expect(files).to.be.length(1)
                expect(files[0].path).to.equal(hash)
                files[0].content.pipe(concat((content) => {
                  expect(content.toString()).to.contain('Check out some of the other files in this directory:')
                  done()
                }))
              }))
            })
            .catch((err) => {
              expect(err).to.not.exist
            })
        })

        it('errors on invalid key', (done) => {
          const hash = 'somethingNotMultihash'
          ipfs.files.get(hash)
            .then((stream) => {})
            .catch((err) => {
              expect(err).to.exist
              const errString = err.toString()
              if (errString === 'Error: invalid ipfs ref path') {
                expect(err.toString()).to.contain('Error: invalid ipfs ref path')
              }
              if (errString === 'Error: Invalid Key') {
                expect(err.toString()).to.contain('Error: Invalid Key')
              }
              done()
            })
        })
      })
    })
  })
}
