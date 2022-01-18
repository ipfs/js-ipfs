import client from 'prom-client'
import Boom from '@hapi/boom'
import debug from 'debug'

// Clear the register to make sure we're not registering multiple ones
client.register.clear()

/** @type {Record<string, client.Gauge<any>>} */
const gauges = {}

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
    // @ts-expect-error libp2p does not exist on ipfs
    const metrics = ipfs.libp2p.metrics

    if (metrics) {
      for (const [system, components] of metrics.getComponentMetrics().entries()) {
        for (const [component, componentMetrics] of components.entries()) {
          for (const [metricName, metricValue] of componentMetrics.entries()) {
            const name = `${system}-${component}-${metricName}`.replace(/-/g, '_')

            if (!gauges[name]) { // eslint-disable-line max-depth
              gauges[name] = new client.Gauge({ name, help: name })
            }

            gauges[name].set(metricValue)
          }
        }
      }
    }

    return h.response(await client.register.metrics())
      .type(client.register.contentType)
  }
}, {
  method: 'POST',
  path: '/debug/logs',
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
    if (!process.env.IPFS_MONITORING) {
      throw Boom.notImplemented('Monitoring is disabled. Enable it by setting environment variable IPFS_MONITORING')
    }

    if (!request.query.debug) {
      debug.disable()
    } else {
      debug.enable(request.query.debug)
    }

    return h.response()
  }
}]
