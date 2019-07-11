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

          try {
            pbNode = DAGNode.create(someData)
          } catch (err) {
            return cb(err)
          }

          cborNode = {
            data: someData
          }

          cb()
        },
        (cb) => {
          try {
            nodePb = DAGNode.create(Buffer.from('I am inside a Protobuf'))
          } catch (err) {
            return cb(err)
          }

          cb()
        },
        (cb) => {
          dagPB.util.cid(dagPB.util.serialize(nodePb))
            .then(cid => {
              cidPb = cid
              cb()
            }, cb)
        },
        (cb) => {
          nodeCbor = {
            someData: 'I am inside a Cbor object',
            pb: cidPb
          }

          dagCBOR.util.cid(dagCBOR.util.serialize(nodeCbor))
            .then(cid => {
              cidCbor = cid
              cb()
            }, cb)
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

        dagPB.util.cid(dagPB.util.serialize(node))
          .then(cid => {
            expect(cid).to.eql(cidPb)
            done()
          })
          .catch(done)
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

        dagCBOR.util.cid(dagCBOR.util.serialize(node))
          .then(cid => {
            expect(cid).to.eql(cidCbor)
            done()
          })
          .catch(done)
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

        dagCBOR.util.cid(dagCBOR.util.serialize(node))
          .then(cid => {
            expect(cid).to.eql(cidCbor)
            done()
          })
          .catch(done)
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

    it('should get only a CID, due to resolving locally only', function (done) {
      ipfs.dag.get(cidCbor, 'pb/Data', { localResolve: true }, (err, result) => {
        expect(err).to.not.exist()
        expect(result.value.equals(cidPb)).to.be.true()
        done()
      })
    })

    it('should get a node added as CIDv0 with a CIDv1', done => {
      const input = Buffer.from(`TEST${Date.now()}`)

      const node = dagPB.DAGNode.create(input)

      ipfs.dag.put(node, { format: 'dag-pb', hashAlg: 'sha2-256' }, (err, cid) => {
        expect(err).to.not.exist()
        expect(cid.version).to.equal(0)

        const cidv1 = cid.toV1()

        ipfs.dag.get(cidv1, (err, output) => {
          expect(err).to.not.exist()
          expect(output.value.Data).to.eql(input)
          done()
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
          expect(Unixfs.unmarshal(output.value.Data).data).to.eql(input)
          done()
        })
      })
    })

    it('should be able to get part of a dag-cbor node', (done) => {
      const cbor = {
        foo: 'dag-cbor-bar'
      }
      ipfs.dag.put(cbor, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid) => {
        expect(err).to.not.exist()
        expect(cid.codec).to.equal('dag-cbor')
        cid = cid.toBaseEncodedString('base32')
        expect(cid).to.equal('bafyreic6f672hnponukaacmk2mmt7vs324zkagvu4hcww6yba6kby25zce')
        ipfs.dag.get(cid, 'foo', (err, result) => {
          expect(err).to.not.exist()
          expect(result.value).to.equal('dag-cbor-bar')
          done()
        })
      })
    })

    it('should be able to traverse from one dag-cbor node to another', (done) => {
      const cbor1 = {
        foo: 'dag-cbor-bar'
      }

      ipfs.dag.put(cbor1, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid1) => {
        expect(err).to.not.exist()

        const cbor2 = { other: cid1 }

        ipfs.dag.put(cbor2, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid2) => {
          expect(err).to.not.exist()

          ipfs.dag.get(cid2, 'other/foo', (err, result) => {
            expect(err).to.not.exist()
            expect(result.value).to.equal('dag-cbor-bar')
            done()
          })
        })
      })
    })

    it('should be able to get a DAG node with format raw', (done) => {
      const buf = Buffer.from([0, 1, 2, 3])

      ipfs.dag.put(buf, {
        format: 'raw',
        hashAlg: 'sha2-256'
      }, (err, cid) => {
        expect(err).to.not.exist()

        ipfs.dag.get(cid, (err, result) => {
          expect(err).to.not.exist()
          expect(result.value).to.deep.equal(buf)
          done()
        })
      })
    })
  })
}
