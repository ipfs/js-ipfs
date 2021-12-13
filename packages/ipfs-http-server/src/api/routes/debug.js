import client from 'prom-client'
import Boom from '@hapi/boom'

// Clear the register to make sure we're not registering multiple ones
client.register.clear()
const gauge = new client.Gauge({ name: 'number_of_peers', help: 'the_number_of_currently_connected_peers' })

// Endpoint for handling debug metrics
export default [{
  method: 'GET',
  path: '/debug/metrics/prometheus',
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
    if (!process.env.IPFS_MONITORING) {
      throw Boom.notImplemented('Monitoring is disabled. Enable it by setting environment variable IPFS_MONITORING')
    }

    const { ipfs } = request.server.app
    const peers = await ipfs.swarm.peers()

    gauge.set(peers.length)

    const metrics = await client.register.metrics()

    return h.response(metrics)
      .type(client.register.contentType)
  }
}]
