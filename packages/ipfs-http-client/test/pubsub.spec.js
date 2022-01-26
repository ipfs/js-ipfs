/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import defer from 'p-defer'
import { factory } from './utils/factory.js'

const f = factory()

describe('.pubsub', function () {
  this.timeout(20 * 1000)
  describe('.subscribe', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    /** @type {any} */
    let ctl

    beforeEach(async function () {
      this.timeout(30 * 1000) // slow CI

      ctl = await await f.spawn({
        args: ['--enable-pubsub-experiment']
      })

      ipfs = ctl.api
    })

    afterEach(() => f.clean())

    it('.onError when connection is closed', async () => {
      const topic = 'gossipboom'
      let messageCount = 0
      const onError = defer()

      await ipfs.pubsub.subscribe(topic, message => {
        messageCount++

        if (messageCount === 2) {
          // Stop the daemon
          ctl.stop().catch()
        }
      }, {
        onError: onError.resolve
      })

      await ipfs.pubsub.publish(topic, uint8ArrayFromString('hello'))
      await ipfs.pubsub.publish(topic, uint8ArrayFromString('bye'))

      await expect(onError.promise).to.eventually.be.fulfilled().and.to.be.instanceOf(Error)
    })

    it('does not call onError when aborted', async () => {
      const controller = new AbortController()
      const topic = 'gossipabort'
      const messages = []
      const onError = defer()
      const onReceived = defer()

      await ipfs.pubsub.subscribe(topic, message => {
        messages.push(message)
        if (messages.length === 2) {
          onReceived.resolve()
        }
      }, {
        onError: onError.resolve,
        signal: controller.signal
      })

      await ipfs.pubsub.publish(topic, uint8ArrayFromString('hello'))
      await ipfs.pubsub.publish(topic, uint8ArrayFromString('bye'))

      await onReceived.promise
      controller.abort()

      // Stop the daemon
      await ctl.stop()
      // Just to make sure no error is caused by above line
      setTimeout(onError.resolve, 200, 'aborted')

      await expect(onError.promise).to.eventually.be.fulfilled().and.to.equal('aborted')
    })
  })
})
