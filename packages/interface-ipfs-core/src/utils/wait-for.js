import delay from 'delay'
import errCode from 'err-code'

/**
 * Wait for async function `test` to resolve true or timeout after options.timeout milliseconds.
 *
 * @param {() => Promise<boolean> | boolean} test
 * @param {object} [options]
 * @param {number} [options.timeout]
 * @param {number} [options.interval]
 * @param {string} [options.name]
 */
export default async function waitFor (test, options) {
  const opts = Object.assign({ timeout: 5000, interval: 0, name: 'event' }, options)
  const start = Date.now()

  while (true) {
    if (await test()) {
      return
    }

    if (Date.now() > start + opts.timeout) {
      throw errCode(new Error(`Timed out waiting for ${opts.name}`), 'ERR_TIMEOUT')
    }

    await delay(opts.interval)
  }
}
