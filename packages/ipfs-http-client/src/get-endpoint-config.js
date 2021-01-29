'use strict'

const configure = require('./lib/configure')

module.exports = configure(api => {
  return () => {
    const url = new URL(api.opts.base || '')
    return {
      host: url.hostname,
      port: url.port,
      protocol: url.protocol,
      pathname: url.pathname,
      'api-path': url.pathname
    }
  }
})
