'use strict'

const delay = require('delay')
const errCode = require('err-code')

// Wait for async function `test` to resolve true or timeout after
// options.timeout milliseconds.
module.exports = async function waitFor (test, options) {
  options = Object.assign({ timeout: 5000, interval: 0, name: 'event' }, options)
  const start = Date.now()

  while (true) {
    if (await test()) {
      return
    }

    if (Date.now() > start + options.timeout) {
      throw errCode(new Error(`Timed out waiting for ${options.name}`), 'ERR_TIMEOUT')
    }

    await delay(options.interval)
  }
}
