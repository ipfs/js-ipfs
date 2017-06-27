'use strict'

const promisify = require('promisify-es6')
const moduleConfig = require('./utils/module-config')
const streamToValue = require('./utils/stream-to-value')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return promisify((id, callback) => {
    const request = {
      path: 'ping',
      args: id,
      qs: { n: 1 }
    }

    // Transform the response stream to a value:
    // { Success: <boolean>, Time: <number>, Text: <string> }
    const transform = (res, callback) => {
      streamToValue(res, (err, res) => {
        if (err) {
          return callback(err)
        }

        // go-ipfs http api currently returns 3 lines for a ping.
        // they're a little messed, so take the correct values from each lines.
        const pingResult = {
          Success: res[1].Success,
          Time: res[1].Time,
          Text: res[2].Text
        }

        callback(null, pingResult)
      })
    }

    send.andTransform(request, transform, callback)
  })
}
