'use strict'

const { expect } = require('../utils/mocha')
const loadFixture = require('aegir/fixtures')
const CID = require('cids')
const drain = require('it-drain')
const map = require('it-map')

const pinTypes = {
  direct: 'direct',
  recursive: 'recursive',
  indirect: 'indirect',
  all: 'all'
}

const fixtures = Object.freeze({
  // NOTE: files under 'directory' need to be different than standalone ones in 'files'
  directory: Object.freeze({
    cid: new CID('QmY8KdYQSYKFU5hM7F5ioZ5yYSgV5VZ1kDEdqfRL3rFgcd'),
    files: Object.freeze([Object.freeze({
      path: 'test-folder/ipfs-add.js',
      data: loadFixture('test/fixtures/test-folder/ipfs-add.js', 'interface-ipfs-core'),
      cid: new CID('QmbKtKBrmeRHjNCwR4zAfCJdMVu6dgmwk9M9AE9pUM9RgG')
    }), Object.freeze({
      path: 'test-folder/files/ipfs.txt',
      data: loadFixture('test/fixtures/test-folder/files/ipfs.txt', 'interface-ipfs-core'),
      cid: new CID('QmdFyxZXsFiP4csgfM5uPu99AvFiKH62CSPDw5TP92nr7w')
    })])
  }),
  files: Object.freeze([Object.freeze({
    data: loadFixture('test/fixtures/testfile.txt', 'interface-ipfs-core'),
    cid: new CID('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
  }), Object.freeze({
    data: loadFixture('test/fixtures/test-folder/files/hello.txt', 'interface-ipfs-core'),
    cid: new CID('QmY9cxiHqTFoWamkQVkpmmqzBrY3hCBEL2XNu3NtX74Fuu')
  })])
})

const clearPins = async (ipfs) => {
  await drain(ipfs.pin.rmAll(map(ipfs.pin.ls({ type: pinTypes.recursive }), ({ cid }) => cid)))
  await drain(ipfs.pin.rmAll(map(ipfs.pin.ls({ type: pinTypes.direct }), ({ cid }) => cid)))
}

const expectPinned = async (ipfs, cid, type = pinTypes.all, pinned = true) => {
  if (typeof type === 'boolean') {
    pinned = type
    type = pinTypes.all
  }

  const result = await isPinnedWithType(ipfs, cid, type)
  expect(result).to.eql(pinned)
}

const expectNotPinned = (ipfs, cid, type = pinTypes.all) => {
  return expectPinned(ipfs, cid, type, false)
}

async function isPinnedWithType (ipfs, cid, type) {
  try {
    for await (const _ of ipfs.pin.ls({ paths: cid, type })) { // eslint-disable-line no-unused-vars
      return true
    }
    return false
  } catch (err) {
    return false
  }
}

module.exports = {
  fixtures,
  clearPins,
  expectPinned,
  expectNotPinned,
  isPinnedWithType,
  pinTypes
}
