/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const bs58 = require('bs58')
const series = require('async/series')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const UnixFs = require('ipfs-unixfs')
const crypto = require('crypto')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.object.get', function () {
    this.timeout(80 * 1000)

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

    it('should get object by multihash', (done) => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      let node1
      let node2

      series([
        (cb) => {
          ipfs.object.put(obj, (err, node) => {
            expect(err).to.not.exist()
            node1 = node
            cb()
          })
        },
        (cb) => {
          ipfs.object.get(node1.multihash, (err, node) => {
            expect(err).to.not.exist()
            node2 = node

            // because js-ipfs-api can't infer if the
            // returned Data is Buffer or String
            if (typeof node2.data === 'string') {
              node2.data = Buffer.from(node2.data)
            }
            cb()
          })
        },
        (cb) => {
          expect(node1.data).to.eql(node2.data)
          expect(node1.links).to.eql(node2.links)
          expect(node1.multihash).to.eql(node2.multihash)
          cb()
        }
      ], done)
    })

    it('should get object by multihash (promised)', () => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      return ipfs.object.put(testObj).then((node1) => {
        return ipfs.object.get(node1.multihash).then((node2) => {
          // because js-ipfs-api can't infer if the
          // returned Data is Buffer or String
          if (typeof node2.data === 'string') {
            node2.data = Buffer.from(node2.data)
          }

          expect(node1.data).to.deep.equal(node2.data)
          expect(node1.links).to.deep.equal(node2.links)
        })
      })
    })

    it('should get object by multihash string', (done) => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      let node1
      let node2

      series([
        (cb) => {
          ipfs.object.put(obj, (err, node) => {
            expect(err).to.not.exist()
            node1 = node
            cb()
          })
        },
        (cb) => {
          // get object from ipfs multihash string
          ipfs.object.get(node1.toJSON().multihash, (err, node) => {
            expect(err).to.not.exist()
            // because js-ipfs-api can't infer if the
            // returned Data is Buffer or String
            if (typeof node.data === 'string') {
              node.data = Buffer.from(node.data)
            }
            node2 = node
            cb()
          })
        },
        (cb) => {
          expect(node1.data).to.eql(node2.data)
          expect(node1.links).to.eql(node2.links)
          expect(node1.multihash).to.eql(node2.multihash)
          cb()
        }
      ], done)
    })

    it('should get object by multihash string (promised)', () => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      return ipfs.object.put(obj)
        .then((node1) => {
          return ipfs.object.get(node1.toJSON().multihash)
            .then((node2) => {
              // because js-ipfs-api can't infer if the
              // returned Data is Buffer or String
              if (typeof node2.data === 'string') {
                node2.data = Buffer.from(node2.data)
              }

              expect(node1.data).to.deep.equal(node2.data)
              expect(node1.links).to.deep.equal(node2.links)
            })
        })
    })

    it('should get object with links by multihash string', (done) => {
      let node1a
      let node1b
      let node1c
      let node2

      series([
        (cb) => {
          DAGNode.create(Buffer.from('Some data 1'), (err, node) => {
            expect(err).to.not.exist()
            node1a = node
            cb()
          })
        },
        (cb) => {
          DAGNode.create(Buffer.from('Some data 2'), (err, node) => {
            expect(err).to.not.exist()
            node2 = node
            cb()
          })
        },
        (cb) => {
          const link = node2.toJSON()
          link.name = 'some-link'
          DAGNode.addLink(node1a, link, (err, node) => {
            expect(err).to.not.exist()
            node1b = node
            cb()
          })
        },
        (cb) => {
          ipfs.object.put(node1b, cb)
        },
        (cb) => {
          ipfs.object.get(node1b.multihash, (err, node) => {
            expect(err).to.not.exist()

            // because js-ipfs-api can't infer if the
            // returned Data is Buffer or String
            if (typeof node.data === 'string') {
              node.data = Buffer.from(node.data)
            }

            node1c = node
            cb()
          })
        },
        (cb) => {
          expect(node1a.data).to.eql(node1c.data)
          expect(node1b.multihash).to.eql(node1c.multihash)
          cb()
        }
      ], done)
    })

    it('should get object by base58 encoded multihash', (done) => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      let node1a
      let node1b

      series([
        (cb) => {
          ipfs.object.put(obj, (err, node) => {
            expect(err).to.not.exist()
            node1a = node
            cb()
          })
        },
        (cb) => {
          ipfs.object.get(node1a.multihash, { enc: 'base58' }, (err, node) => {
            expect(err).to.not.exist()
            // because js-ipfs-api can't infer if the
            // returned Data is Buffer or String
            if (typeof node.data === 'string') {
              node.data = Buffer.from(node.data)
            }
            node1b = node
            cb()
          })
        },
        (cb) => {
          expect(node1a.multihash).to.eql(node1b.multihash)
          expect(node1a.data).to.eql(node1b.data)
          expect(node1a.links).to.eql(node1b.links)
          cb()
        }
      ], done)
    })

    it('should get object by base58 encoded multihash string', (done) => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      let node1a
      let node1b

      series([
        (cb) => {
          ipfs.object.put(obj, (err, node) => {
            expect(err).to.not.exist()
            node1a = node
            cb()
          })
        },
        (cb) => {
          ipfs.object.get(bs58.encode(node1a.multihash).toString(), { enc: 'base58' }, (err, node) => {
            expect(err).to.not.exist()
            // because js-ipfs-api can't infer if the
            // returned Data is Buffer or String
            if (typeof node.data === 'string') {
              node.data = Buffer.from(node.data)
            }
            node1b = node
            cb()
          })
        },
        (cb) => {
          expect(node1a.multihash).to.eql(node1b.multihash)
          expect(node1a.data).to.eql(node1b.data)
          expect(node1a.links).to.eql(node1b.links)
          cb()
        }
      ], done)
    })

    it('supplies unadulterated data', () => {
      // has to be big enough to span several DAGNodes
      let required = 1024 * 3000

      // can't just request `required` random bytes in the browser yet
      // as it's more than 65536:
      // https://github.com/crypto-browserify/randombytes/pull/15
      let data = Buffer.alloc(0)
      const maxBytes = 65536
      let next = maxBytes

      while (data.length !== required) {
        data = Buffer.concat([data, crypto.randomBytes(next)])
        next = maxBytes

        if (data.length + maxBytes > required) {
          next = required - data.length
        }
      }

      return ipfs.files.add({
        path: '',
        content: data
      })
        .then((result) => {
          return ipfs.object.get(result[0].hash)
        })
        .then((node) => {
          const meta = UnixFs.unmarshal(node.data)

          expect(meta.fileSize()).to.equal(data.length)
        })
    })
  })
}
