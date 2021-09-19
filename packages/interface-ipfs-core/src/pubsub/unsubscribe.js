/* eslint-env mocha */

import { isBrowser, isWebWorker, isElectronRenderer } from 'ipfs-utils/src/env.js'
import { getTopic } from './utils.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import waitFor from '../utils/wait-for.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testUnsubscribe (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pubsub.unsubscribe', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    // Browser/worker has max ~5 open HTTP requests to the same origin
    const count = isBrowser || isWebWorker || isElectronRenderer ? 5 : 10

    it(`should subscribe and unsubscribe ${count} times`, async () => {
      const someTopic = getTopic()
      /** @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn[]} */
      const handlers = Array.from(Array(count), () => msg => {})

      for (let i = 0; i < count; i++) {
        await ipfs.pubsub.subscribe(someTopic, handlers[i])
      }

      for (let i = 0; i < count; i++) {
        await ipfs.pubsub.unsubscribe(someTopic, handlers[i])
      }

      // Unsubscribing in the http client aborts the connection we hold open
      // but does not wait for it to close so the subscription list sometimes
      // takes a little time to empty
      await waitFor(async () => {
        const subs = await ipfs.pubsub.ls()

        return subs.length === 0
      }, {
        interval: 1000,
        timeout: 30000,
        name: 'subscriptions to be empty'
      })
    })

    it(`should subscribe ${count} handlers and unsubscribe once with no reference to the handlers`, async () => {
      const someTopic = getTopic()
      for (let i = 0; i < count; i++) {
        await ipfs.pubsub.subscribe(someTopic, (msg) => {})
      }
      await ipfs.pubsub.unsubscribe(someTopic)

      // Unsubscribing in the http client aborts the connection we hold open
      // but does not wait for it to close so the subscription list sometimes
      // takes a little time to empty
      await waitFor(async () => {
        const subs = await ipfs.pubsub.ls()

        return subs.length === 0
      }, {
        interval: 1000,
        timeout: 30000,
        name: 'subscriptions to be empty'
      })
    })
  })
}
