'use strict'

const register = require('prom-client').register
const client = require('prom-client')

// Endpoint for handling debug metrics
module.exports = (server) => {
  const api = server.select('API')
  // Clear the register to make sure we're not registering multiple ones
  register.clear()
  const gauge = new client.Gauge({ name: 'number_of_peers', help: 'the_number_of_currently_connected_peers' })

  api.route({
    method: 'GET',
    path: '/debug/metrics/prometheus',
    handler: (request, reply) => {
      if (!process.env.IPFS_MONITORING) {
        return reply('Monitoring is disabled. Enable it by setting environment variable IPFS_MONITORING')
          .code(501) // 501 = Not Implemented
      }
      server.app.ipfs.swarm.peers((err, res) => {
        if (err) {
          return reply(err).code(500)
        }
        const count = res.length
        gauge.set(count)
        reply(register.metrics()).header('Content-Type', register.contentType)
      })
    }
  })
}
