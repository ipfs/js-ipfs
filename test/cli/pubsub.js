/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const delay = require('delay')
const waterfall = require('async/waterfall')
const HttpAPI = require('../../src/http-api')
// TODO needs to use ipfs-factory-daemon
const createTempNode = ''
const repoPath = require('./index').repoPath
const ipfs = require('../utils/ipfs-exec')(repoPath)

describe.skip('pubsub', () => {
  const topicA = 'nonscentsA'
  const topicB = 'nonscentsB'
  const topicC = 'nonscentsC'
  let node
  let id

  before((done) => {
    createTempNode(1, (err, _node) => {
      expect(err).to.not.exist
      node = _node
      node.goOnline(done)
    })
  })

  after((done) => {
    node.goOffline(done)
  })

  describe('api running', () => {
    let httpAPI

    before((done) => {
      httpAPI = new HttpAPI(repoPath)

      waterfall([
        (cb) => httpAPI.start(cb),
        (cb) => node.id(cb),
        (_id, cb) => {
          id = _id
          ipfs(`swarm connect ${id.addresses[0]}`)
            .then(() => cb())
            .catch(cb)
        }
      ], done)
    })

    after((done) => {
      httpAPI.stop(done)
    })

    it('subscribe and publish', () => {
      const sub = ipfs(`pubsub sub ${topicA}`)

      sub.stdout.on('data', (c) => {
        expect(c.toString()).to.be.eql('world\n')
        sub.kill()
      })

      return Promise.all([
        sub.catch(ignoreKill),
        delay(200)
          .then(() => ipfs(`pubsub pub ${topicA} world`))
          .then((out) => {
            expect(out).to.be.eql('')
          })
      ])
    })

    it('ls', () => {
      const sub = ipfs(`pubsub sub ${topicB}`)

      sub.stdout.once('data', (data) => {
        expect(data.toString()).to.be.eql('world\n')
        ipfs('pubsub ls')
          .then((out) => {
            expect(out).to.be.eql(topicB)
            sub.kill()
          })
      })

      return Promise.all([
        sub.catch(ignoreKill),
        delay(200)
          .then(() => ipfs(`pubsub pub ${topicB} world`))
      ])
    })

    it('peers', () => {
      const handler = (msg) => {
        expect(msg.data.toString()).to.be.eql('world')
        ipfs(`pubsub peers ${topicC}`)
          .then((out) => {
            expect(out).to.be.eql(id.id)
            sub2.kill()
            node.pubsub.unsubscribe(topicC, handler)
          })
      }

      const sub1 = node.pubsub.subscribe(topicC, handler)
      const sub2 = ipfs(`pubsub sub ${topicC}`)

      return Promise.all([
        sub1,
        sub2.catch(ignoreKill),
        delay(200)
          .then(() => ipfs(`pubsub pub ${topicC} world`))
      ])
    })
  })
})

function ignoreKill (err) {
  if (!err.killed) {
    throw err
  }
}
