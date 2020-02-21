'use strict'

const configure = require('./lib/configure')

module.exports = configure(({ apiAddr, apiPath }) => {
  const url = new URL(apiAddr)
  return () => ({
    host: url.hostname,
    port: url.port,
    protocol: url.protocol.split(':')[0], // remove ":"
    'api-path': apiPath
  })
})
