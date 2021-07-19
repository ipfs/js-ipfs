'use strict'

const { CID } = require('multiformats/cid')
const fromString = require('uint8arrays/from-string')
const loadFixture = require('aegir/utils/fixtures')

const ONE_MEG = Math.pow(2, 20)

exports.fixtures = Object.freeze({
  directory: Object.freeze({
    cid: CID.parse('QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP'),
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
    data: fromString('Plz add me!\n')
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
