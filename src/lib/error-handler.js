'use strict'

const { HTTPError } = require('ky-universal')
const log = require('debug')('ipfs-http-client:lib:error-handler')

function isJsonResponse (res) {
  return (res.headers.get('Content-Type') || '').startsWith('application/json')
}

module.exports = async function errorHandler (response) {
  if (response.ok) return

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
