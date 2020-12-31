/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const { describe, Promise, console } = require('ipfs-utils/src/globalthis')
const all = require('it-all')
const uint8ArrayFromString = require('uint8arrays/from-string')

const f = require('./utils/factory')()

describe('.pubsub', function () {
  this.timeout(20 * 1000)
  describe('.subscribe', () => {
    let ipfs
    let ctl

    before(async function () {
      this.timeout(30 * 1000) // slow CI

      ctl = await await f.spawn({
        args: '--enable-pubsub-experiment'
      })

      ipfs = ctl.api
    })

    after(() => f.clean())

    it('.onError when connection is closed', async () => {
      const topic = 'gossipboom'
      const messages = []
      let onError

      // eslint-disable-next-line promise/param-names
      const error = new Promise((_, reject) => {
        onError = reject
      })

      ipfs.pubsub.subscribe(topic, message => {
        messages.push(message)
      }, {
        onError
      })

      await ipfs.pubsub.publish(topic, 'hello')
      await ipfs.pubsub.publish(topic, 'bye')
      // Stop the daemon
      await ctl.stop()

      await expect(error).to.eventually.be.rejectedWith(/network/ig)
      expect(messages).property('length').equal(2)
    })
  })
})
