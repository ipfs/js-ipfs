'use strict'

const hat = require('hat')

function waitForPeers (ipfs, topic, peersToWait, waitForMs, callback) {
  const start = Date.now()

  const checkPeers = () => {
    ipfs.pubsub.peers(topic, (err, peers) => {
      if (err) {
        return callback(err)
      }

      const missingPeers = peersToWait
        .map((e) => peers.indexOf(e) !== -1)
        .filter((e) => !e)

      if (missingPeers.length === 0) {
        return callback()
      }

      if (Date.now() > start + waitForMs) {
        return callback(new Error('Timed out waiting for peers'))
      }

      setTimeout(checkPeers, 10)
    })
  }

  checkPeers()
}

exports.waitForPeers = waitForPeers

function makeCheck (n, done) {
  let i = 0
  return (err) => {
    if (err) {
      return done(err)
    }

    if (++i === n) {
      done()
    }
  }
}

exports.makeCheck = makeCheck

exports.getTopic = () => 'pubsub-tests-' + hat()
