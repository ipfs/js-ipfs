'use strict'

// Wait for async function `test` to callback(null, true) or timeout after
// options.timeout milliseconds.
module.exports = function waitFor (test, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  options = options || {}
  options.timeout = options.timeout || 5000
  options.interval = options.interval || 0
  options.name = options.name || 'event'

  const start = Date.now()

  const check = () => {
    test((err, arrived) => {
      if (err) {
        return callback(err)
      }

      if (arrived) {
        return callback()
      }

      if (Date.now() > start + options.timeout) {
        return callback(new Error(`Timed out waiting for ${options.name}`))
      }

      setTimeout(check, options.interval)
    })
  }

  check()
}

module.exports.promises = async (test, options) => {
  options = Object.assign({ timeout: 5000, interval: 0, name: 'event' }, options)
  const start = Date.now()

  while (true) {
    const arrived = await test()

    if (arrived) {
      return
    }

    if (Date.now() > start + options.timeout) {
      throw new Error(`Timed out waiting for ${options.name}`)
    }

    await new Promise(resolve => setTimeout(resolve, options.interval))
  }
}
