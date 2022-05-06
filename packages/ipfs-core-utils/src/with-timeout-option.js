/* eslint-disable no-unreachable */

import { TimeoutController } from 'timeout-abort-controller'
import { anySignal } from 'any-signal'
import parseDuration from 'parse-duration'
import { TimeoutError } from './errors.js'

/**
 * @template {any[]} Args
 * @template {Promise<any> | AsyncIterable<any>} R - The return type of `fn`
 * @param {(...args:Args) => R} fn
 * @param {number} [optionsArgIndex]
 * @returns {(...args:Args) => R}
 */
export function withTimeoutOption (fn, optionsArgIndex) {
  // eslint-disable-next-line
  return /** @returns {R} */(/** @type {Args} */...args) => {
    const options = args[optionsArgIndex == null ? args.length - 1 : optionsArgIndex]
    if (!options || !options.timeout) return fn(...args)

    const timeout = typeof options.timeout === 'string'
      ? parseDuration(options.timeout)
      : options.timeout

    const controller = new TimeoutController(timeout)

    options.signal = anySignal([options.signal, controller.signal])

    const fnRes = fn(...args)
    // eslint-disable-next-line promise/param-names
    const timeoutPromise = new Promise((_resolve, reject) => {
      controller.signal.addEventListener('abort', () => {
        reject(new TimeoutError())
      })
    })

    const start = Date.now()

    const maybeThrowTimeoutError = () => {
      if (controller.signal.aborted) {
        throw new TimeoutError()
      }

      const timeTaken = Date.now() - start

      // if we have starved the event loop by adding microtasks, we could have
      // timed out already but the TimeoutController will never know because it's
      // setTimeout will not fire until we stop adding microtasks
      if (timeTaken > timeout) {
        controller.abort()
        throw new TimeoutError()
      }
    }

    // @ts-expect-error
    if (fnRes[Symbol.asyncIterator]) {
      // @ts-expect-error
      return (async function * () {
        // @ts-expect-error
        const it = fnRes[Symbol.asyncIterator]()

        try {
          while (true) {
            const { value, done } = await Promise.race([it.next(), timeoutPromise])

            if (done) {
              break
            }

            maybeThrowTimeoutError()

            yield value
          }
        } catch (/** @type {any} */ err) {
          maybeThrowTimeoutError()

          throw err
        } finally {
          controller.clear()

          if (it.return) {
            it.return()
          }
        }
      })()
    }

    // @ts-expect-error
    return (async () => {
      try {
        const res = await Promise.race([fnRes, timeoutPromise])

        maybeThrowTimeoutError()

        return res
      } catch (/** @type {any} */ err) {
        maybeThrowTimeoutError()

        throw err
      } finally {
        controller.clear()
      }
    })()
  }
}
