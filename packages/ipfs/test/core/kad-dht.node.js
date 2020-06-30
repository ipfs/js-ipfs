/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const path = require('path')
const all = require('it-all')
const { Buffer } = require('buffer')
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
      content: Buffer.from('hello kad 1')
    }

    const filesAdded = await all(nodeB.add(file))
    const data = await concat(nodeA.cat(filesAdded[0].cid))

    expect(data.slice()).to.eql(file.content)
  })

  it('add a file in C, fetch through B in A', async function () {
    this.timeout(30 * 1000)
    const file = {
      path: 'testfile2.txt',
      content: Buffer.from('hello kad 2')
    }

    const filesAdded = await all(nodeC.add(file))
    const data = await concat(nodeA.cat(filesAdded[0].cid))

    expect(data.slice()).to.eql(file.content)
  })
})
