/* eslint-env mocha */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const series = require('async/series')
const parallel = require('async/parallel')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'js' })

const ipfsExec = require('../utils/ipfs-exec')

const daemonOpts = {
  exec: `./src/cli/bin.js`,
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

describe('dht', () => {
  let nodes = []
  let ipfsA
  let ipfsB
  let idA
  let idB
  let multiaddrB

  // spawn daemons
  before(function (done) {
    this.timeout(80 * 1000)
    series([
      (cb) => df.spawn(daemonOpts, (err, _ipfsd) => {
        expect(err).to.not.exist()

        ipfsA = ipfsExec(_ipfsd.repoPath)
        nodes.push(_ipfsd)
        cb()
      }),
      (cb) => df.spawn(daemonOpts, (err, _ipfsd) => {
        expect(err).to.not.exist()

        ipfsB = ipfsExec(_ipfsd.repoPath)
        nodes.push(_ipfsd)
        cb()
      })
    ], done)
  })

  // get ids
  before(function (done) {
    this.timeout(80 * 1000)
    parallel([
      (cb) => nodes[0].api.id((err, res) => {
        expect(err).to.not.exist()

        idA = res.id
        cb()
      }),
      (cb) => nodes[1].api.id((err, res) => {
        expect(err).to.not.exist()

        multiaddrB = res.addresses[0]
        idB = res.id
        cb()
      })
    ], done)
  })

  // connect daemons
  before(function (done) {
    this.timeout(80 * 1000)

    nodes[0].api.swarm.connect(multiaddrB, done)
  })

  after((done) => parallel(nodes.map((node) => (cb) => node.stop(cb)), done))

  it('should be able to put a value to the dht and get it afterwards', function () {
    this.timeout(60 * 1000)

    const key = 'testkey'
    const value = 'testvalue'

    return ipfsA(`dht put ${key} ${value}`)
      .then((res) => {
        expect(res).to.exist()

        return ipfsB(`dht get ${key}`)
      })
      .then((res) => {
        expect(res).to.exist()
        expect(res).to.have.string(value)
      })
  })

  it('should be able to provide data and to be present in the findproviders', function () {
    this.timeout(60 * 1000)
    let cidAdded

    return ipfsA('add src/init-files/init-docs/readme')
      .then((res) => {
        expect(res).to.exist()
        cidAdded = res.split(' ')[1]

        return ipfsA(`dht provide ${cidAdded}`)
      })
      .then((res) => {
        expect(res).to.exist()

        return ipfsB(`dht findprovs ${cidAdded}`)
      })
      .then((res) => {
        expect(res).to.exist()
        expect(res).to.have.string(idA)
      })
  })

  it('findpeer', function () {
    this.timeout(60 * 1000)

    return ipfsA(`dht findpeer ${idB}`)
      .then((res) => {
        expect(res).to.exist()
        expect(res).to.have.string(multiaddrB)
      })
  })

  it('query', function () {
    this.timeout(60 * 1000)

    return ipfsA(`dht query ${idB}`)
      .then((res) => {
        expect(res).to.exist()
        expect(res).to.have.string(idB)
      })
  })
})
