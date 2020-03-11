'use strict'

/** @typedef { import("./lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return () => {
    const url = new URL(api.opts.base)
    return {
      host: url.hostname,
      port: url.port,
      protocol: url.protocol,
      pathname: url.pathname,
      'api-path': url.pathname
    }
  }
}
