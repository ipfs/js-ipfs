'use strict'

const { expect } = require('../utils/mocha')
const loadFixture = require('aegir/utils/fixtures')
const CID = require('cids')
const drain = require('it-drain')
const map = require('it-map')
const fromString = require('uint8arrays/from-string')
const first = require('it-first')

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
    data: fromString('Plz add me!\n'),
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

const clearRemotePins = async (ipfs) => {
  for (const { service } of await ipfs.pin.remote.service.ls()) {
    const cids = []
    const status = ['queued', 'pinning', 'pinned', 'failed']
    for await (const pin of ipfs.pin.remote.ls({ status, service })) {
      cids.push(pin.cid)
    }

    if (cids.length > 0) {
      await ipfs.pin.remote.rmAll({
        cid: cids,
        status,
        service
      })
    }
  }
}

const addRemotePins = async (ipfs, service, pins) => {
  const requests = []
  for (const [name, cid] of Object.entries(pins)) {
    requests.push(ipfs.pin.remote.add(cid, {
      name,
      service,
      background: true
    }))
  }
  await Promise.all(requests)
}

const clearServices = async (ipfs) => {
  const services = await ipfs.pin.remote.service.ls()
  await Promise.all(services.map(({ service }) => ipfs.pin.remote.service.rm(service)))
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
    const res = await first(ipfs.pin.ls({ paths: cid, type }))

    return Boolean(res)
  } catch (err) {
    return false
  }
}

module.exports = {
  fixtures,
  clearPins,
  clearServices,
  clearRemotePins,
  addRemotePins,
  expectPinned,
  expectNotPinned,
  isPinnedWithType,
  pinTypes
}
