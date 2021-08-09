'use strict'

const { expect } = require('../utils/mocha')
const loadFixture = require('aegir/utils/fixtures')
const { CID } = require('multiformats/cid')
const drain = require('it-drain')
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
    cid: CID.parse('QmY8KdYQSYKFU5hM7F5ioZ5yYSgV5VZ1kDEdqfRL3rFgcd'),
    files: Object.freeze([Object.freeze({
      path: 'test-folder/ipfs-add.js',
      data: loadFixture('test/fixtures/test-folder/ipfs-add.js', 'interface-ipfs-core'),
      cid: CID.parse('QmbKtKBrmeRHjNCwR4zAfCJdMVu6dgmwk9M9AE9pUM9RgG')
    }), Object.freeze({
      path: 'test-folder/files/ipfs.txt',
      data: loadFixture('test/fixtures/test-folder/files/ipfs.txt', 'interface-ipfs-core'),
      cid: CID.parse('QmdFyxZXsFiP4csgfM5uPu99AvFiKH62CSPDw5TP92nr7w')
    })])
  }),
  files: Object.freeze([Object.freeze({
    data: fromString('Plz add me!\n'),
    cid: CID.parse('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
  }), Object.freeze({
    data: loadFixture('test/fixtures/test-folder/files/hello.txt', 'interface-ipfs-core'),
    cid: CID.parse('QmY9cxiHqTFoWamkQVkpmmqzBrY3hCBEL2XNu3NtX74Fuu')
  })])
})

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 */
const clearPins = async (ipfs) => {
  await drain(ipfs.pin.rmAll(ipfs.pin.ls({ type: pinTypes.recursive })))
  await drain(ipfs.pin.rmAll(ipfs.pin.ls({ type: pinTypes.direct })))
}

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 */
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

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {string} service
 * @param {Record<string, CID>} pins
 */
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

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 */
const clearServices = async (ipfs) => {
  const services = await ipfs.pin.remote.service.ls()
  await Promise.all(services.map(({ service }) => ipfs.pin.remote.service.rm(service)))
}

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {CID} cid
 * @param {string} type
 * @param {boolean} pinned
 */
const expectPinned = async (ipfs, cid, type = pinTypes.all, pinned = true) => {
  if (typeof type === 'boolean') {
    pinned = type
    type = pinTypes.all
  }

  const result = await isPinnedWithType(ipfs, cid, type)
  expect(result).to.eql(pinned)
}

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {CID} cid
 * @param {string} type
 */
const expectNotPinned = (ipfs, cid, type = pinTypes.all) => {
  return expectPinned(ipfs, cid, type, false)
}

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {CID} cid
 * @param {string} type
 */
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
