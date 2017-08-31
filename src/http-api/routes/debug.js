const register = require('prom-client').register
const client = require('prom-client')

// Endpoint for handling debug metrics
module.exports = (server) => {
  const api = server.select('API')
  const gauge = new client.Gauge({ name: 'number_of_peers', help: 'the_number_of_currently_connected_peers' })

  setInterval(() => {
    server.app.ipfs.swarm.peers((err, res) => {
      if (err) throw err
      const count = res.length
      gauge.set(count)
    })
  }, 5000)

  api.route({
    method: 'GET',
    path: '/debug/metrics/prometheus',
    handler: (request, reply) => {
      reply(register.metrics()).header('Content-Type', register.contentType)
    }
  })
}
