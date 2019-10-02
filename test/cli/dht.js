/* eslint-env mocha */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const path = require('path')
const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({
  type: 'js',
  IpfsClient: require('ipfs-http-client')
})

const ipfsExec = require('../utils/ipfs-exec')

const daemonOpts = {
  exec: path.resolve(`${__dirname}/../../src/cli/bin.js`),
  config: {
    Bootstrap: [],
    Discovery: {
      MDNS: {
        Enabled: false
      },
      webRTCStar: {
        Enabled: false
      }
    }
  },
  initOptions: { bits: 512 }
}

// TODO: unskip when DHT is enabled: https://github.com/ipfs/js-ipfs/pull/1994
describe.skip('dht', () => {
  const nodes = []
  let ipfsA
  let ipfsB
  let idA
  let idB
  let multiaddrB

  // spawn daemons
  before(async function () {
    this.timeout(80 * 1000)

    const ipfsdA = await df.spawn(daemonOpts)
    ipfsA = ipfsExec(ipfsdA.repoPath)
    nodes.push(ipfsdA)

    const ipfsdB = await df.spawn(daemonOpts)
    ipfsB = ipfsExec(ipfsdB.repoPath)
    nodes.push(ipfsdB)
  })

  // get ids
  before(async function () {
    this.timeout(80 * 1000)

    const res = await Promise.all([
      nodes[0].api.id(),
      nodes[1].api.id()
    ])

    idA = res[0].id
    idB = res[1].id
    multiaddrB = res[1].addresses[0]
  })

  // connect daemons
  before(function () {
    this.timeout(80 * 1000)

    return nodes[0].api.swarm.connect(multiaddrB)
  })

  after(() => Promise.all(nodes.map((node) => node.stop())))

  it('should be able to put a value to the dht and get it afterwards', async function () {
    this.timeout(60 * 1000)

    const key = 'testkey'
    const value = 'testvalue'

    const res = await ipfsA(`dht put ${key} ${value}`)
    expect(res).to.exist()

    const res2 = await ipfsB(`dht get ${key}`)
    expect(res2).to.have.string(value)
  })

  it('should be able to provide data and to be present in the findproviders', async function () {
    this.timeout(60 * 1000)

    const res = await ipfsA('add src/init-files/init-docs/readme')
    expect(res).to.exist()
    const cidAdded = res.split(' ')[1]

    const res2 = await ipfsA(`dht provide ${cidAdded}`)
    expect(res2).to.exist()

    const res3 = await ipfsB(`dht findprovs ${cidAdded}`)
    expect(res3).to.have.string(idA)
  })

  it('findpeer', async function () {
    this.timeout(60 * 1000)

    const res = await ipfsA(`dht findpeer ${idB}`)
    expect(res).to.have.string(multiaddrB)
  })

  it('query', async function () {
    this.timeout(60 * 1000)

    const res = await ipfsA(`dht query ${idB}`)
    expect(res).to.have.string(idB)
  })
})
