'use strict'

module.exports = (config) => {
  return () => ({
    host: config.host,
    port: config.port
  })
}
