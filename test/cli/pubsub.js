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
const createRepo = require('../utils/create-repo-nodejs')
const IPFS = require('../../src')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

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
  let ipfsd
  let cli
  let httpApi

  const topicA = 'nonscentsA'
  const topicB = 'nonscentsB'
  const topicC = 'nonscentsC'

  let repo = createRepo()
  before(function (done) {
    this.timeout(60 * 1000)

    node = new IPFS({
      repo: createRepo(),
      init: { bits: 1024 },
      EXPERIMENTAL: {
        pubsub: true
      },
      config
    })

    node.once('ready', () => {
      done()
    })

    node.once('error', (err) => {
      done(err)
    })
  })

  after((done) => {
    node.stop((err) => {
      expect(err).to.not.exist()
      repo.teardown(done)
    })
  })

  before((done) => {
    df.spawn({
      type: 'js',
      args: ['--enable-pubsub-experiment'],
      exec: `${process.cwd()}/src/cli/bin.js`,
      config
    }, (err, _node) => {
      expect(err).to.not.exist()
      httpApi = _node.api
      ipfsd = _node
      httpApi.repoPath = ipfsd.repoPath
      done()
    })
  })

  after((done) => ipfsd.stop(done))

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

    const sub = cli(`pubsub sub ${topicB}`)

    sub.stdout.once('data', (data) => {
      expect(data.toString().trim()).to.be.eql('world')
      cli('pubsub ls')
        .then((out) => {
          expect(out.trim()).to.be.eql(topicB)
          sub.kill()
        })
    })

    return Promise.all([
      sub.catch(ignoreKill),
      delay(200)
        .then(() => cli(`pubsub pub ${topicB} world`))
    ])
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
