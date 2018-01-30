'use strict'

exports = module.exports

exports.do = (request, reply) => {
  const server = request.server
  setImmediate(() => server.stop(() => {}))
  return reply()
}
