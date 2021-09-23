import http from 'http'
import https from 'https'

/**
 * @param {URL} [url]
 */
export default (url) => {
  if (!url) {
    throw new Error('URL required')
  }

  return url.protocol.startsWith('https') ? https.Agent : http.Agent
}
