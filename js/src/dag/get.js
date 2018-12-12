/* eslint-env mocha */
'use strict'

const { series, eachSeries } = require('async')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const dagCBOR = require('ipld-dag-cbor')
const Unixfs = require('ipfs-unixfs')
const CID = require('cids')
const { spawnNodeWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dag.get', () => {
    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodeWithId(factory, (err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    let pbNode
    let cborNode
    let nodePb
    let nodeCbor
    let cidPb
    let cidCbor

    before((done) => {
      series([
        (cb) => {
          const someData = Buffer.from('some other data')

          DAGNode.create(someData, (err, node) => {
            expect(err).to.not.exist()
            pbNode = node
            cb()
          })

          cborNode = {
            data: someData
          }
        },
        (cb) => {
          dagPB.DAGNode.create(Buffer.from('I am inside a Protobuf'), (err, node) => {
            expect(err).to.not.exist()
            nodePb = node
            cb()
          })
        },
        (cb) => {
          dagPB.util.cid(nodePb, (err, cid) => {
            expect(err).to.not.exist()
            cidPb = cid
            cb()
          })
        },
        (cb) => {
          nodeCbor = {
            someData: 'I am inside a Cbor object',
            pb: cidPb
          }

          dagCBOR.util.cid(nodeCbor, (err, cid) => {
            expect(err).to.not.exist()
            cidCbor = cid
            cb()
          })
        },
        (cb) => {
          eachSeries([
            { node: nodePb, multicodec: 'dag-pb', hashAlg: 'sha2-256' },
            { node: nodeCbor, multicodec: 'dag-cbor', hashAlg: 'sha2-256' }
          ], (el, cb) => {
            ipfs.dag.put(el.node, {
              format: el.multicodec,
              hashAlg: el.hashAlg
            }, cb)
          }, cb)
        }
      ], done)
    })

    it('should get a dag-pb node', (done) => {
      ipfs.dag.put(pbNode, {
        format: 'dag-pb',
        hashAlg: 'sha2-256'
      }, (err, cid) => {
        expect(err).to.not.exist()
        ipfs.dag.get(cid, (err, result) => {
          expect(err).to.not.exist()
          const node = result.value
          expect(pbNode.toJSON()).to.eql(node.toJSON())
          done()
        })
      })
    })

    it('should get a dag-cbor node', (done) => {
      ipfs.dag.put(cborNode, {
        format: 'dag-cbor',
        hashAlg: 'sha2-256'
      }, (err, cid) => {
        expect(err).to.not.exist()
        ipfs.dag.get(cid, (err, result) => {
          expect(err).to.not.exist()

          const node = result.value
          expect(cborNode).to.eql(node)
          done()
        })
      })
    })

    it('should get a dag-pb node with path', (done) => {
      ipfs.dag.get(cidPb, '/', (err, result) => {
        expect(err).to.not.exist()

        const node = result.value

        dagPB.util.cid(node, (err, cid) => {
          expect(err).to.not.exist()
          expect(cid).to.eql(cidPb)
          done()
        })
      })
    })

    it('should get a dag-pb node local value', function (done) {
      ipfs.dag.get(cidPb, 'Data', (err, result) => {
        expect(err).to.not.exist()
        expect(result.value).to.eql(Buffer.from('I am inside a Protobuf'))
        done()
      })
    })

    it.skip('should get a dag-pb node value one level deep', (done) => {})
    it.skip('should get a dag-pb node value two levels deep', (done) => {})

    it('should get a dag-cbor node with path', (done) => {
      ipfs.dag.get(cidCbor, '/', (err, result) => {
        expect(err).to.not.exist()

        const node = result.value

        dagCBOR.util.cid(node, (err, cid) => {
          expect(err).to.not.exist()
          expect(cid).to.eql(cidCbor)
          done()
        })
      })
    })

    it('should get a dag-cbor node local value', (done) => {
      ipfs.dag.get(cidCbor, 'someData', (err, result) => {
        expect(err).to.not.exist()
        expect(result.value).to.eql('I am inside a Cbor object')
        done()
      })
    })

    it.skip('should get dag-cbor node value one level deep', (done) => {})
    it.skip('should get dag-cbor node value two levels deep', (done) => {})
    it.skip('should get dag-cbor value via dag-pb node', (done) => {})

    it('should get dag-pb value via dag-cbor node', function (done) {
      ipfs.dag.get(cidCbor, 'pb/Data', (err, result) => {
        expect(err).to.not.exist()
        expect(result.value).to.eql(Buffer.from('I am inside a Protobuf'))
        done()
      })
    })

    it('should get by CID string', (done) => {
      const cidCborStr = cidCbor.toBaseEncodedString()

      ipfs.dag.get(cidCborStr, (err, result) => {
        expect(err).to.not.exist()

        const node = result.value

        dagCBOR.util.cid(node, (err, cid) => {
          expect(err).to.not.exist()
          expect(cid).to.eql(cidCbor)
          done()
        })
      })
    })

    it('should get by CID string + path', function (done) {
      const cidCborStr = cidCbor.toBaseEncodedString()

      ipfs.dag.get(cidCborStr + '/pb/Data', (err, result) => {
        expect(err).to.not.exist()
        expect(result.value).to.eql(Buffer.from('I am inside a Protobuf'))
        done()
      })
    })

    it('should get a node added as CIDv0 with a CIDv1', done => {
      const input = Buffer.from(`TEST${Date.now()}`)

      dagPB.DAGNode.create(input, (err, node) => {
        expect(err).to.not.exist()

        ipfs.dag.put(node, { format: 'dag-pb', hashAlg: 'sha2-256' }, (err, cid) => {
          expect(err).to.not.exist()
          expect(cid.version).to.equal(0)

          const cidv1 = cid.toV1()

          ipfs.dag.get(cidv1, (err, output) => {
            expect(err).to.not.exist()
            expect(output.value.data).to.eql(input)
            done()
          })
        })
      })
    })

    it('should get a node added as CIDv1 with a CIDv0', done => {
      const input = Buffer.from(`TEST${Date.now()}`)

      ipfs.add(input, { cidVersion: 1, rawLeaves: false }, (err, res) => {
        expect(err).to.not.exist()

        const cidv1 = new CID(res[0].hash)
        expect(cidv1.version).to.equal(1)

        const cidv0 = cidv1.toV0()

        ipfs.dag.get(cidv0, (err, output) => {
          expect(err).to.not.exist()
          expect(Unixfs.unmarshal(output.value.data).data).to.eql(input)
          done()
        })
      })
    })
  })
}
