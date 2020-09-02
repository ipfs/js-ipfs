'use strict'

/* eslint-env mocha */

const CID = require('cids')
const { encodeNode } = require('../src/dag')
const { expect } = require('aegir/utils/chai')
const uint8ArrayFromString = require('uint8arrays/from-string')

describe('dag', function () {
  this.timeout(10 * 1000)

  describe('encodeNode / decodeNode', () => {
    it('shoud encode node', () => {
      const cid1 = new CID(
        'bafyreic6f672hnponukaacmk2mmt7vs324zkagvu4hcww6yba6kby25zce'
      )
      const cid2 = new CID('QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')
      const dagNode = {
        hi: 'hello',
        link: cid1,
        nested: {
          struff: {
            here: cid2
          }
        }
      }

      const data = encodeNode(dagNode)

      expect(data.dagNode).to.be.equal(dagNode)
      expect(data.cids).to.be.an.instanceOf(Array)
      expect(data.cids).to.have.property('length', 2)
      expect(data.cids).to.include(cid1)
      expect(data.cids).to.include(cid2)
    })

    it('shoud encode and add buffers to transfer list', () => {
      const cid1 = new CID(
        'bafyreic6f672hnponukaacmk2mmt7vs324zkagvu4hcww6yba6kby25zce'
      )
      const cid2 = new CID('QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')

      const hi = uint8ArrayFromString('hello world')
      const dagNode = {
        hi,
        nested: {
          structure: {
            with: {
              links: [cid1]
            }
          }
        },
        other: {
          link: cid2
        }
      }

      const transfer = []
      const data = encodeNode(dagNode, transfer)

      expect(data.dagNode).to.be.equal(dagNode)
      expect(data.cids).to.be.an.instanceOf(Array)
      expect(data.cids).to.have.property('length', 2)
      expect(data.cids).to.include(cid1)
      expect(data.cids).to.include(cid2)

      expect(transfer).to.be.an.instanceOf(Array)
      expect(transfer).to.have.property('length', 3)
      expect(transfer).to.include(cid1.multihash.buffer)
      expect(transfer).to.include(cid2.multihash.buffer)
      expect(transfer).to.include(hi.buffer)
    })

    it('shoud decode node', () => {
      const cid1 = new CID(
        'bafyreic6f672hnponukaacmk2mmt7vs324zkagvu4hcww6yba6kby25zce'
      )
      const cid2 = new CID('QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')

      const hi = uint8ArrayFromString('hello world')
      const dagNode = {
        hi,
        nested: {
          structure: {
            with: {
              links: [cid1]
            }
          }
        },
        other: {
          link: cid2
        }
      }

      const transfer = []
      const data = encodeNode(dagNode, transfer)

      expect(data.dagNode).to.be.equal(dagNode)
      expect(data.cids).to.be.an.instanceOf(Array)
      expect(data.cids).to.have.property('length', 2)
      expect(data.cids).to.include(cid1)
      expect(data.cids).to.include(cid2)

      expect(transfer).to.be.an.instanceOf(Array)
      expect(transfer).to.have.property('length', 3)
      expect(transfer).to.include(cid1.multihash.buffer)
      expect(transfer).to.include(cid2.multihash.buffer)
      expect(transfer).to.include(hi.buffer)
    })
  })
})
