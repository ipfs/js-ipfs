/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const delay = require('delay')
const series = require('async/series')
const ipfsExec = require('../utils/ipfs-exec')
const IPFS = require('../../src')
const path = require('path')
const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'js' })

const config = {
  Bootstrap: [],
  Discovery: {
    MDNS: {
      Enabled:
        false
    }
  }
}

describe('pubsub', function () {
  this.timeout(80 * 1000)

  let node
  let ipfsdA
  let ipfsdB
  let cli
  let httpApi

  const topicA = 'nonscentsA'
  const topicB = 'nonscentsB'
  const topicC = 'nonscentsC'

  before(function (done) {
    this.timeout(60 * 1000)

    DaemonFactory
      .create({ type: 'proc' })
      .spawn({
        exec: IPFS,
        initOptions: { bits: 512 },
        config,
        args: ['--enable-pubsub-experiment']
      }, (err, _ipfsd) => {
        expect(err).to.not.exist()
        ipfsdA = _ipfsd
        node = _ipfsd.api
        done()
      })
  })

  after((done) => ipfsdB.stop(done))

  before((done) => {
    df.spawn({
      initOptions: { bits: 512 },
      args: ['--enable-pubsub-experiment'],
      exec: path.resolve(`${__dirname}/../../src/cli/bin.js`),
      config
    }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      httpApi = _ipfsd.api
      ipfsdB = _ipfsd
      httpApi.repoPath = ipfsdB.repoPath
      done()
    })
  })

  after((done) => ipfsdA.stop(done))
  after((done) => ipfsdB.stop(done))

  before((done) => {
    cli = ipfsExec(httpApi.repoPath)
    done()
  })

  it('subscribe and publish', () => {
    const sub = cli(`pubsub sub ${topicA}`)

    sub.stdout.on('data', (c) => {
      expect(c.toString().trim()).to.be.eql('world')
      sub.kill()
    })

    return Promise.all([
      sub.catch(ignoreKill),
      delay(1000)
        .then(() => cli(`pubsub pub ${topicA} world`))
        .then((out) => {
          expect(out).to.be.eql('')
        })
    ])
  })

  it('ls', function () {
    this.timeout(80 * 1000)
    let sub

    return new Promise((resolve, reject) => {
      sub = cli(`pubsub sub ${topicB}`)
      sub.stdout.once('data', d => resolve(d.toString().trim()))
      delay(200).then(() => cli(`pubsub pub ${topicB} world`))
    })
      .then(data => expect(data).to.be.eql('world'))
      .then(() => cli('pubsub ls'))
      .then(out => {
        expect(out.trim()).to.be.eql(topicB)
        sub.kill()
        return sub.catch(ignoreKill)
      })
  })

  it('peers', (done) => {
    let sub
    let instancePeerId
    let peerAddress
    const handler = (msg) => {
      expect(msg.data.toString()).to.be.eql('world')
      cli(`pubsub peers ${topicC}`)
        .then((out) => {
          expect(out.trim()).to.be.eql(instancePeerId)
          sub.kill()
          node.pubsub.unsubscribe(topicC, handler)
          done()
        })
    }

    series([
      (cb) => httpApi.id((err, peerInfo) => {
        expect(err).to.not.exist()
        peerAddress = peerInfo.addresses[0]
        expect(peerAddress).to.exist()
        cb()
      }),
      (cb) => node.id((err, peerInfo) => {
        expect(err).to.not.exist()
        instancePeerId = peerInfo.id.toString()
        cb()
      }),
      (cb) => node.swarm.connect(peerAddress, cb),
      (cb) => node.pubsub.subscribe(topicC, handler, cb)
    ],
    (err) => {
      expect(err).to.not.exist()
      sub = cli(`pubsub sub ${topicC}`)

      return Promise.all([
        sub.catch(ignoreKill),
        delay(1000)
          .then(() => cli(`pubsub pub ${topicC} world`))
      ])
    })
  })
})

function ignoreKill (err) {
  if (!err.killed) {
    throw err
  }
}
