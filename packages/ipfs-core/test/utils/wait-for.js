import delay from 'delay'
import errCode from 'err-code'

/**
 * Wait for async function `test` to resolve true or timeout after options.timeout milliseconds
 *
 * @param {() => boolean | Promise<boolean>} test
 * @param {object} options
 * @param {number} [options.timeout]
 * @param {string} [options.name]
 * @param {number} [options.interval]
 */
export async function waitFor (test, options) {
  const opts = Object.assign({ timeout: 5000, interval: 1000, name: 'event' }, options)
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
