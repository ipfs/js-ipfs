
/* eslint-env mocha */

import { CID } from 'multiformats/cid'
import { encodeNode, decodeNode } from '../src/dag.js'
import { ipc } from './util.js'
import { expect } from 'aegir/utils/chai.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

describe('dag (browser)', function () {
  this.timeout(10 * 1000)
  const move = ipc()

  describe('encodeNode / decodeNode', () => {
    it('should decode dagNode over message channel', async () => {
      const cid1 = CID.parse(
        'bafyreic6f672hnponukaacmk2mmt7vs324zkagvu4hcww6yba6kby25zce'
      )
      const cid2 = CID.parse('QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')

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
                CID.parse(cid1)
              ]
            }
          }
        },
        other: {
          link: CID.parse(cid2)
        }
      }
      const transfer = new Set()

      const nodeOut = decodeNode(
        await move(encodeNode(nodeIn, transfer), transfer)
      )

      expect(nodeOut).to.be.deep.equal({
        hi: uint8ArrayFromString('hello world'),
        nested: {
          structure: {
            with: {
              links: [
                CID.parse(cid1)
              ]
            }
          }
        },
        other: {
          link: CID.parse(cid2)
        }
      })

      expect([...transfer]).to.containSubset(
        [{ byteLength: 0 }, { byteLength: 0 }, { byteLength: 0 }],
        'transferred buffers were cleared'
      )
    })
  })
})
