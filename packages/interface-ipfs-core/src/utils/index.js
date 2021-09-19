import { CID } from 'multiformats/cid'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import loadFixture from 'aegir/utils/fixtures.js'

const ONE_MEG = Math.pow(2, 20)

export const fixtures = Object.freeze({
  directory: Object.freeze({
    cid: CID.parse('QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP'),
    /** @type {Record<string, Buffer>} */
    files: Object.freeze({
      'pp.txt': loadFixture('test/fixtures/test-folder/pp.txt', 'interface-ipfs-core'),
      'holmes.txt': loadFixture('test/fixtures/test-folder/holmes.txt', 'interface-ipfs-core'),
      'jungle.txt': loadFixture('test/fixtures/test-folder/jungle.txt', 'interface-ipfs-core'),
      'alice.txt': loadFixture('test/fixtures/test-folder/alice.txt', 'interface-ipfs-core'),
      'files/hello.txt': loadFixture('test/fixtures/test-folder/files/hello.txt', 'interface-ipfs-core'),
      'files/ipfs.txt': loadFixture('test/fixtures/test-folder/files/ipfs.txt', 'interface-ipfs-core')
    })
  }),
  smallFile: Object.freeze({
    cid: CID.parse('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'),
    data: uint8ArrayFromString('Plz add me!\n')
  }),
  bigFile: Object.freeze({
    cid: CID.parse('QmcKEs7mbxbGPPc2zo77E6CPwgaSbY4SmD2MFh16AqaR9e'),
    data: Uint8Array.from(new Array(ONE_MEG * 15).fill(0))
  }),
  emptyFile: Object.freeze({
    cid: CID.parse('QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH'),
    data: new Uint8Array(0)
  })
})
