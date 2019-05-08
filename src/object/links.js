/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const series = require('async/series')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { asDAGLink } = require('./utils')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.object.links', function () {
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

    it('should get empty links by multihash', (done) => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      ipfs.object.put(testObj, (err, cid) => {
        expect(err).to.not.exist()

        ipfs.object.get(cid, (err, node) => {
          expect(err).to.not.exist()

          ipfs.object.links(cid, (err, links) => {
            expect(err).to.not.exist()
            expect(node.links).to.deep.equal(links)
            done()
          })
        })
      })
    })

    it('should get empty links by multihash (promised)', async () => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const cid = await ipfs.object.put(testObj)
      const node = await ipfs.object.get(cid)
      const links = await ipfs.object.links(cid)

      expect(node.links).to.eql(links)
    })

    it('should get links by multihash', (done) => {
      let node1a
      let node1b
      let node1bCid
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
          asDAGLink(node2, 'some-link', (err, link) => {
            expect(err).to.not.exist()

            DAGNode.addLink(node1a, link, (err, node) => {
              expect(err).to.not.exist()
              node1b = node

              dagPB.util.cid(node, (err, cid) => {
                expect(err).to.not.exist()
                node1bCid = cid
                cb()
              })
            })
          })
        },
        (cb) => {
          ipfs.object.put(node1b, (cb))
        },
        (cb) => {
          ipfs.object.links(node1bCid, (err, links) => {
            expect(err).to.not.exist()
            expect(node1b.links[0].toJSON()).to.eql(links[0].toJSON())
            cb()
          })
        }
      ], done)
    })

    it('should get links by base58 encoded multihash', (done) => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      ipfs.object.put(testObj, (err, cid) => {
        expect(err).to.not.exist()

        ipfs.object.get(cid, (err, node) => {
          expect(err).to.not.exist()

          ipfs.object.links(cid.buffer, { enc: 'base58' }, (err, links) => {
            expect(err).to.not.exist()
            expect(node.links).to.deep.equal(links)
            done()
          })
        })
      })
    })

    it('should get links by base58 encoded multihash string', (done) => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      ipfs.object.put(testObj, (err, cid) => {
        expect(err).to.not.exist()

        ipfs.object.get(cid, (err, node) => {
          expect(err).to.not.exist()

          ipfs.object.links(cid.toBaseEncodedString(), { enc: 'base58' }, (err, links) => {
            expect(err).to.not.exist()
            expect(node.links).to.deep.equal(links)
            done()
          })
        })
      })
    })

    it('should get links from CBOR object', (done) => {
      const hashes = []
      ipfs.add(Buffer.from('test data'), (err, res1) => {
        expect(err).to.not.exist()
        hashes.push(res1[0].hash)
        ipfs.add(Buffer.from('more test data'), (err, res2) => {
          hashes.push(res2[0].hash)
          expect(err).to.not.exist()
          const obj = {
            some: 'data',
            mylink: { '/': hashes[0] },
            myobj: {
              anotherLink: { '/': hashes[1] }
            }
          }
          ipfs.dag.put(obj, (err, cid) => {
            expect(err).to.not.exist()
            ipfs.object.links(cid, (err, links) => {
              expect(err).to.not.exist()
              expect(links.length).to.eql(2)

              // TODO: js-ipfs succeeds but go returns empty strings for link name
              // const names = [links[0].name, links[1].name]
              // expect(names).includes('mylink')
              // expect(names).includes('myobj/anotherLink')

              const cids = [links[0].cid.toString(), links[1].cid.toString()]
              expect(cids).includes(hashes[0])
              expect(cids).includes(hashes[1])

              done()
            })
          })
        })
      })
    })
  })
}
