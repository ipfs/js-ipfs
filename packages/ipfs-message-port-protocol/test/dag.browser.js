'use strict'

/* eslint-env mocha */

const CID = require('cids')
const { encodeCID, decodeCID, encodeNode, decodeNode } = require('../src/dag')
const { ipc } = require('./util')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const { Buffer } = require('buffer')

describe('dag (browser)', function () {
  this.timeout(10 * 1000)
  const move = ipc()

  describe('encodeCID / decodeCID', () => {
    it('should decode to CID over message channel', async () => {
      const cidIn = new CID('Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr')
      const cidDataIn = encodeCID(cidIn)
      const cidDataOut = await move(cidDataIn)
      const cidOut = decodeCID(cidDataOut)

      expect(cidOut).to.be.an.instanceof(CID)
      expect(CID.isCID(cidOut)).to.be.true()
      expect(cidOut.equals(cidIn)).to.be.true()
      expect(cidIn.multihash)
        .property('byteLength')
        .not.be.equal(0)
    })

    it('should decode CID and transfer bytes', async () => {
      const cidIn = new CID('Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr')
      const transfer = []
      const cidDataIn = encodeCID(cidIn, transfer)
      const cidDataOut = await move(cidDataIn, transfer)
      const cidOut = decodeCID(cidDataOut)

      expect(cidOut).to.be.an.instanceof(CID)
      expect(CID.isCID(cidOut)).to.be.true()
      expect(cidIn.multihash).property('byteLength', 0)
      expect(cidOut.multihash)
        .property('byteLength')
        .to.not.be.equal(0)
      expect(cidOut.toString()).to.be.equal(
        'Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr'
      )
    })

    it('should decode dagNode over message channel', async () => {
      const cid1 = new CID(
        'bafyreic6f672hnponukaacmk2mmt7vs324zkagvu4hcww6yba6kby25zce'
      )
      const cid2 = new CID('QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')

      const hi = Buffer.from('hello world')
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
      const cid1 = new CID(
        'bafyreic6f672hnponukaacmk2mmt7vs324zkagvu4hcww6yba6kby25zce'
      )
      const cid2 = new CID('QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')

      const hi = Buffer.from('hello world')
      const nodeIn = {
        hi: Buffer.from(hi),
        nested: {
          structure: {
            with: {
              links: [new CID(cid1)]
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
      })

      expect(transfer).to.containSubset(
        [{ byteLength: 0 }, { byteLength: 0 }, { byteLength: 0 }],
        'tarnsferred buffers were cleared'
      )
    })
  })
})
