'use strict'

/* eslint-env mocha */

const CID = require('cids')
const { encodeNode, decodeNode } = require('../src/dag')
const { ipc } = require('./util')
const { expect } = require('aegir/utils/chai')
const uint8ArrayFromString = require('uint8arrays/from-string')

describe('dag (browser)', function () {
  this.timeout(10 * 1000)
  const move = ipc()

  describe('encodeNode / decodeNode', () => {
    it('should decode dagNode over message channel', async () => {
      const cid1 = new CID(
        'bafyreic6f672hnponukaacmk2mmt7vs324zkagvu4hcww6yba6kby25zce'
      )
      const cid2 = new CID('QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')

      const hi = uint8ArrayFromString('hello world')
      const nodeIn = {
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

      const nodeOut = decodeNode(await move(encodeNode(nodeIn)))

      expect(nodeOut).to.be.deep.equal(nodeIn)
    })

    it('should decode dagNode over message channel & transfer bytes', async () => {
      const cid1 = 'bafyreic6f672hnponukaacmk2mmt7vs324zkagvu4hcww6yba6kby25zce'
      const cid2 = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'

      const hi = uint8ArrayFromString('hello world')
      const nodeIn = {
        hi,
        nested: {
          structure: {
            with: {
              links: [
                new CID(cid1)
              ]
            }
          }
        },
        other: {
          link: new CID(cid2)
        }
      }
      const transfer = []

      const nodeOut = decodeNode(
        await move(encodeNode(nodeIn, transfer), transfer)
      )

      expect(nodeOut).to.be.deep.equal({
        hi: uint8ArrayFromString('hello world'),
        nested: {
          structure: {
            with: {
              links: [
                new CID(cid1)
              ]
            }
          }
        },
        other: {
          link: new CID(cid2)
        }
      })

      expect(transfer).to.containSubset(
        [{ byteLength: 0 }, { byteLength: 0 }, { byteLength: 0 }],
        'tarnsferred buffers were cleared'
      )
    })
  })
})
