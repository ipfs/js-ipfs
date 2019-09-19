'use strict'

const { HTTPError } = require('ky-universal')
const log = require('debug')('ipfs-http-client:lib:error-handler')
const { isNode, isElectronMain } = require('ipfs-utils/src/env')

function isJsonResponse (res) {
  return (res.headers.get('Content-Type') || '').startsWith('application/json')
}

module.exports = async function errorHandler (input, options, response) {
  if (response.ok) {
    // FIXME: remove when fixed https://github.com/sindresorhus/ky-universal/issues/8
    //
    // ky clones the response for each handler. In Node.js the response body is
    // piped to 2 PassThroughs, one becomes the real body and the other is used
    // in the clone.
    //
    // If the body in the clone is not consumed or destroyed the highwater mark
    // will be reached (for large payloads) and stop the real body from flowing.
    if (isNode || isElectronMain) response.body.destroy()
    return
  }

  let msg

  try {
    if (isJsonResponse(response)) {
      const data = await response.json()
      log(data)
      msg = data.Message || data.message
    } else {
      msg = await response.text()
    }
  } catch (err) {
    log('Failed to parse error response', err)
    // Failed to extract/parse error message from response
    throw new HTTPError(response)
  }

  if (!msg) throw new HTTPError(response)
  throw Object.assign(new Error(msg), { status: response.status })
}
