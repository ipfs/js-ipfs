/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const expect = require('chai').expect
const dagPB = require('ipld-dag-pb')
const dagCBOR = require('ipld-dag-cbor')
const series = require('async/series')
const pull = require('pull-stream')

module.exports = (common) => {
  describe.only('.dag.resolve', () => {
    let ipfs
    let nodePb
    let nodeCbor
    let cidPb
    let cidCbor

    before((done) => {
      common.setup((err, factory) => {
        expect(err).to.not.exist
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist
          ipfs = node
          done()
        })
      })
    })

    after((done) => {
      common.teardown(done)
    })

    it('populate', (done) => {
      series([
        (cb) => {
          dagPB.DAGNode.create(new Buffer('I am inside a Protobuf'), (err, node) => {
            expect(err).to.not.exist
            nodePb = node
            cb()
          })
        },
        (cb) => {
          dagPB.util.cid(nodePb, (err, cid) => {
            expect(err).to.not.exist
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
            expect(err).to.not.exist
            cidCbor = cid
            console.log(nodeCbor)
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
            ipfs.dag.put(el.node, el.multicodec, el.hashAlg, (err) => {
              if (err) {
                console.log(err)
              }
              console.log('put', el.multicodec)

              cb()
            })
          }),
          pull.onEnd(done)
        )
      }
    })

    describe('callback API', () => {
      describe('.resolve', () => {
        it('dag-pb get the node', (done) => {
          ipfs.dag.resolve(cidPb, '/', (err, result) => {
            expect(err).to.not.exist

            dagPB.util.cid(result, (err, cid) => {
              expect(err).to.not.exist
              expect(cid).to.eql(cidPb)
              done()
            })
          })
        })

        it('dag-pb local scope', (done) => {
          ipfs.dag.resolve(cidPb, 'data', (err, result) => {
            expect(err).to.not.exist
            expect(result).to.eql(new Buffer('I am inside a Protobuf'))
            done()
          })
        })

        it.skip('dag-pb one level', (done) => {})
        it.skip('dag-pb two levels', (done) => {})

        it('dag-cbor get the node', (done) => {
          ipfs.dag.get(cidCbor, (err, result) => {
          // ipfs.dag.resolve(cidCbor, '/', (err, result) => {
            expect(err).to.not.exist

            console.log('get the node')

            dagCBOR.util.cid(result, (err, cid) => {
              expect(err).to.not.exist
              expect(cid).to.eql(cidCbor)
              done()
            })
          })
        })

        it('dag-cbor local scope', (done) => {
          ipfs.dag.resolve(cidCbor, 'someData', (err, result) => {
            expect(err).to.not.exist
            expect(result).to.eql('I am inside a Cbor object')
            done()
          })
        })

        it.skip('dag-cbor one level', (done) => {})
        it.skip('dag-cbor two levels', (done) => {})
        it.skip('from dag-pb to dag-cbor', (done) => {})

        it('from dag-cbor to dag-pb', (done) => {
          ipfs.dag.resolve(cidCbor, 'pb/data', (err, result) => {
            expect(err).to.not.exist
            expect(result).to.eql(new Buffer('I am inside a Protobuf'))
            done()
          })
        })
      })
    })

    describe('promise API', () => {
      describe('.resolve', () => {})
    })
  })
}
