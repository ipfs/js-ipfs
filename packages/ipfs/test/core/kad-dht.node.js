/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const path = require('path')
const uint8ArrayFromString = require('uint8arrays/from-string')
const concat = require('it-concat')

const factory = require('../utils/factory')
const df = factory()

const config = {
  Bootstrap: [],
  Discovery: {
    MDNS: {
      Enabled: false
    },
    webRTCStar: {
      Enabled: false
    }
  }
}

const createNode = () => df.spawn({
  exec: path.resolve(`${__dirname}/../../src/cli/bin.js`),
  config,
  initOptions: { bits: 512 },
  args: ['--preload-enabled=false']
})

describe.skip('kad-dht is routing content and peers correctly', () => {
  let nodeA
  let nodeB
  let nodeC
  let addrB
  let addrC

  before(async function () {
    this.timeout(30 * 1000)

    nodeA = (await createNode()).api
    nodeB = (await createNode()).api
    nodeC = (await createNode()).api

    addrB = (await nodeB.id()).addresses[0]
    addrC = (await nodeC.id()).addresses[0]

    await nodeA.swarm.connect(addrB)
    await nodeB.swarm.connect(addrC)
  })

  after(() => df.clean())

  it('add a file in B, fetch in A', async function () {
    this.timeout(30 * 1000)
    const file = {
      path: 'testfile1.txt',
      content: uint8ArrayFromString('hello kad 1')
    }

    const fileAdded = await nodeB.add(file)
    const data = await concat(nodeA.cat(fileAdded.cid))

    expect(data.slice()).to.eql(file.content)
  })

  it('add a file in C, fetch through B in A', async function () {
    this.timeout(30 * 1000)
    const file = {
      path: 'testfile2.txt',
      content: uint8ArrayFromString('hello kad 2')
    }

    const fileAdded = await nodeC.add(file)
    const data = await concat(nodeA.cat(fileAdded.cid))

    expect(data.slice()).to.eql(file.content)
  })
})
