/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const delay = require('delay')
const HttpAPI = require('../../src/http-api')
const createTempNode = require('../utils/temp-node')
const repoPath = require('./index').repoPath
const ipfs = require('../utils/ipfs-exec')(repoPath)

describe('pubsub', function () {
  this.timeout(30 * 1000)
  let node

  const topicA = 'nonscentsA'
  const topicB = 'nonscentsB'
  const topicC = 'nonscentsC'

  before((done) => {
    createTempNode(1, (err, _node) => {
      expect(err).to.not.exist
      node = _node
      node.goOnline((err) => {
        expect(err).to.not.exist
        done()
      })
    })
  })

  after((done) => {
    node.goOffline(done)
  })

  describe('api running', () => {
    let httpAPI

    before((done) => {
      httpAPI = new HttpAPI(repoPath)
      httpAPI.start(done)
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
      const sub = ipfs(`pubsub sub ${topicC}`)

      sub.stdout.once('data', (data) => {
        expect(data.toString()).to.be.eql('world\n')
        ipfs(`pubsub peers ${topicC}`)
          .then((out) => {
            expect(out).to.be.eql('')
            sub.kill()
          })
      })

      return Promise.all([
        sub.catch(ignoreKill),
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
