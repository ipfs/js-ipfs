/* eslint-disable no-unreachable */
'use strict'

// @ts-ignore
const TimeoutController = require('timeout-abort-controller')
const { anySignal } = require('any-signal')
const { default: parseDuration } = require('parse-duration')
const { TimeoutError } = require('./errors')

/**
 * @template {any[]} Args
 * @template {Promise<any> | AsyncIterable<any>} R - The return type of `fn`
 * @param {(...args:Args) => R} fn
 * @param {number} [optionsArgIndex]
 * @returns {(...args:Args) => R}
 */
function withTimeoutOption (fn, optionsArgIndex) {
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

    // @ts-ignore
    if (fnRes[Symbol.asyncIterator]) {
      // @ts-ignore
      return (async function * () {
        // @ts-ignore
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
        } catch (err) {
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

    // @ts-ignore
    return (async () => {
      try {
        const res = await Promise.race([fnRes, timeoutPromise])

        maybeThrowTimeoutError()

        return res
      } catch (err) {
        maybeThrowTimeoutError()

        throw err
      } finally {
        controller.clear()
      }
    })()
  }
}

module.exports = withTimeoutOption
