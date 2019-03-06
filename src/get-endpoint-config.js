'use strict'

module.exports = (config) => {
  return () => ({
    host: config.host,
    port: config.port,
    protocol: config.protocol,
    'api-path': config['api-path']
  })
}
