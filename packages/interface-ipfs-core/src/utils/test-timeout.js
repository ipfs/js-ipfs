import drain from 'it-drain'

/**
 * @param {*} fn
 * @returns {Promise<void>}
 */
export default function testTimeout (fn) {
  return new Promise((resolve, reject) => {
    // some operations are either synchronous so cannot time out, or complete during
    // processing of the microtask queue so the timeout timer doesn't fire.  If this
    // is the case this is more of a best-effort test..
    setTimeout(() => {
      const start = Date.now()
      let res = fn()

      if (res[Symbol.asyncIterator]) {
        res = drain(res)
      }

      res.then((/** @type {*} */ result) => {
        const timeTaken = Date.now() - start

        if (timeTaken < 100) {
          // the implementation may be too fast to measure a time out reliably on node
          // due to the event loop being blocked.  if it took longer than 100ms though,
          // it almost certainly did not time out
          return resolve()
        }

        reject(new Error(`API call did not time out after ${timeTaken}ms, got ${JSON.stringify(result, null, 2)}`))
      }, (/** @type {Error} */ err) => {
        if (err.name === 'TimeoutError') {
          return resolve()
        }

        const timeTaken = Date.now() - start

        reject(new Error(`Expected TimeoutError after ${timeTaken}ms, got ${err.stack}`))
      })
    }, 10)
  })
}
