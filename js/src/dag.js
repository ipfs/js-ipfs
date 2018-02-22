/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const series = require('async/series')
const pull = require('pull-stream')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const dagCBOR = require('ipld-dag-cbor')
const CID = require('cids')

module.exports = (common) => {
  describe('.dag', () => {
    let ipfs
    let withGo

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          ipfs.id((err, id) => {
            expect(err).to.not.exist()
            withGo = id.agentVersion.startsWith('go-ipfs')
            done()
          })
        })
      })
    })

    after((done) => common.teardown(done))

    let pbNode
    let cborNode

    before((done) => {
      const someData = Buffer.from('some data')

      pbNode = DAGNode.create(someData, (err, node) => {
        expect(err).to.not.exist()
        pbNode = node
        done()
      })

      cborNode = {
        data: someData
      }
    })

    describe('.put', () => {
      it('dag-pb with default hash func (sha2-256)', (done) => {
        ipfs.dag.put(pbNode, {
          format: 'dag-pb',
          hashAlg: 'sha2-256'
        }, done)
      })

      it('dag-pb with custom hash func (sha3-512)', (done) => {
        ipfs.dag.put(pbNode, {
          format: 'dag-pb',
          hashAlg: 'sha3-512'
        }, done)
      })

      // This works because dag-cbor will just treat pbNode as a regular object
      it.skip('dag-pb node with wrong multicodec', (done) => {
        ipfs.dag.put(pbNode, 'dag-cbor', 'sha3-512', (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('dag-cbor with default hash func (sha2-256)', (done) => {
        ipfs.dag.put(cborNode, {
          format: 'dag-cbor',
          hashAlg: 'sha2-256'
        }, done)
      })

      it('dag-cbor with custom hash func (sha3-512)', (done) => {
        ipfs.dag.put(cborNode, {
          format: 'dag-cbor',
          hashAlg: 'sha3-512'
        }, done)
      })

      // This works because dag-pb will serialize any object. If the object
      // has neither a `data` nor `links` field it's serialized as an empty
      // object
      it.skip('dag-cbor node with wrong multicodec', (done) => {
        ipfs.dag.put(cborNode, {
          format: 'dag-pb',
          hashAlg: 'sha3-512'
        }, (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns the cid', (done) => {
        ipfs.dag.put(cborNode, {
          format: 'dag-cbor',
          hashAlg: 'sha2-256'
        }, (err, cid) => {
          expect(err).to.not.exist()
          expect(cid).to.exist()
          expect(CID.isCID(cid)).to.equal(true)
          dagCBOR.util.cid(cborNode, (err, _cid) => {
            expect(err).to.not.exist()
            expect(cid.buffer).to.eql(_cid.buffer)
            done()
          })
        })
      })

      it.skip('pass the cid instead of format and hashAlg', (done) => {})

      // TODO it.skip('Promises support', (done) => {})
    })

    describe('.get', () => {
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

            pbNode = DAGNode.create(someData, (err, node) => {
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
              pb: { '/': cidPb.toBaseEncodedString() }
            }

            dagCBOR.util.cid(nodeCbor, (err, cid) => {
              expect(err).to.not.exist()
              cidCbor = cid
              cb()
            })
          }
        ], store)

        function store () {
          pull(
            pull.values([
              { node: nodePb, multicodec: 'dag-pb', hashAlg: 'sha2-256' },
              { node: nodeCbor, multicodec: 'dag-cbor', hashAlg: 'sha2-256' }
            ]),
            pull.asyncMap((el, cb) => {
              ipfs.dag.put(el.node, {
                format: el.multicodec,
                hashAlg: el.hashAlg
              }, cb)
            }),
            pull.onEnd(done)
          )
        }
      })

      it('dag-pb node', (done) => {
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

      it('dag-cbor node', (done) => {
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

      describe('with path', () => {
        it('dag-pb get the node', (done) => {
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

        it('dag-pb local scope', function (done) {
          // TODO vmx 2018-02-22: Currently not supported in go-ipfs, it might
          // be possible once https://github.com/ipfs/go-ipfs/issues/4728 is
          // done
          if (withGo) {
            this.skip()
          }
          ipfs.dag.get(cidPb, 'Data', (err, result) => {
            expect(err).to.not.exist()
            console.log('vmx: result', result.value)
            expect(result.value.data).to.eql(Buffer.from('I am inside a Protobuf'))
            done()
          })
        })

        it.skip('dag-pb one level', (done) => {})
        it.skip('dag-pb two levels', (done) => {})

        it('dag-cbor get the node', (done) => {
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

        it('dag-cbor local scope', (done) => {
          ipfs.dag.get(cidCbor, 'someData', (err, result) => {
            expect(err).to.not.exist()
            expect(result.value).to.eql('I am inside a Cbor object')
            done()
          })
        })

        it.skip('dag-cbor one level', (done) => {})
        it.skip('dag-cbor two levels', (done) => {})
        it.skip('from dag-pb to dag-cbor', (done) => {})

        it('from dag-cbor to dag-pb', function (done) {
          // TODO vmx 2018-02-22: Currently not supported in go-ipfs, it might
          // be possible once https://github.com/ipfs/go-ipfs/issues/4728 is
          // done
          if (withGo) {
            this.skip()
          }
          ipfs.dag.get(cidCbor, 'pb/Data', (err, result) => {
            expect(err).to.not.exist()
            expect(result.value).to.eql(Buffer.from('I am inside a Protobuf'))
            done()
          })
        })

        it('CID String', (done) => {
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

        it('CID String + path', function (done) {
          // TODO vmx 2018-02-22: Currently not supported in go-ipfs, it might
          // be possible once https://github.com/ipfs/go-ipfs/issues/4728 is
          // done
          if (withGo) {
            this.skip()
          }
          const cidCborStr = cidCbor.toBaseEncodedString()

          ipfs.dag.get(cidCborStr + '/pb/Data', (err, result) => {
            expect(err).to.not.exist()
            expect(result.value).to.eql(Buffer.from('I am inside a Protobuf'))
            done()
          })
        })
      })
    })

    describe.skip('.tree', function () {
      // TODO vmx 2018-02-22: Currently the tree API is not exposed in go-ipfs
      if (withGo) {
        this.skip()
      }

      let nodePb
      let nodeCbor
      let cidPb
      let cidCbor

      before((done) => {
        series([
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
              pb: { '/': cidPb.toBaseEncodedString() }
            }

            dagCBOR.util.cid(nodeCbor, (err, cid) => {
              expect(err).to.not.exist()
              cidCbor = cid
              cb()
            })
          }
        ], store)

        function store () {
          pull(
            pull.values([
              { node: nodePb, multicodec: 'dag-pb', hashAlg: 'sha2-256' },
              { node: nodeCbor, multicodec: 'dag-cbor', hashAlg: 'sha2-256' }
            ]),
            pull.asyncMap((el, cb) => {
              ipfs.dag.put(el.node, {
                format: el.multicodec,
                hashAlg: el.hashAlg
              }, cb)
            }),
            pull.onEnd(done)
          )
        }
      })

      it('.tree with CID', (done) => {
        ipfs.dag.tree(cidCbor, (err, paths) => {
          expect(err).to.not.exist()
          expect(paths).to.eql([
            'pb',
            'someData'
          ])
          done()
        })
      })

      it('.tree with CID and path', (done) => {
        ipfs.dag.tree(cidCbor, 'someData', (err, paths) => {
          expect(err).to.not.exist()
          expect(paths).to.eql([])
          done()
        })
      })

      it('.tree with CID and path as String', (done) => {
        const cidCborStr = cidCbor.toBaseEncodedString()

        ipfs.dag.tree(cidCborStr + '/someData', (err, paths) => {
          expect(err).to.not.exist()
          expect(paths).to.eql([])
          done()
        })
      })

      it('.tree with CID recursive (accross different formats)', (done) => {
        ipfs.dag.tree(cidCbor, { recursive: true }, (err, paths) => {
          expect(err).to.not.exist()
          expect(paths).to.eql([
            'pb',
            'someData',
            'pb/Links',
            'pb/Data'
          ])
          done()
        })
      })

      it('.tree with CID and path recursive', (done) => {
        ipfs.dag.tree(cidCbor, 'pb', { recursive: true }, (err, paths) => {
          expect(err).to.not.exist()
          expect(paths).to.eql([
            'Links',
            'Data'
          ])
          done()
        })
      })
    })
  })
}
