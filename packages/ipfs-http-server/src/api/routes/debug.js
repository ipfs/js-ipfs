/* eslint-disable max-depth */

import client from 'prom-client'
import Boom from '@hapi/boom'
import { disable, enable } from '@libp2p/logger'

// Clear the register to make sure we're not registering multiple ones
client.register.clear()

/** @type {Record<string, client.Gauge<any>>} */
const gauges = {
  nodejs_memory_usage: new client.Gauge({
    name: 'nodejs_memory_usage',
    help: 'nodejs_memory_usage',
    labelNames: Object.keys(process.memoryUsage())
  })
}

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

    Object.entries(process.memoryUsage()).forEach(([key, value]) => {
      gauges.nodejs_memory_usage.set({ [key]: key }, value)
    })

    const { ipfs } = request.server.app
    // @ts-expect-error libp2p does not exist on ipfs
    const metrics = ipfs.libp2p.metrics

    if (metrics) {
      for (const [system, components] of metrics.getComponentMetrics().entries()) {
        for (const [component, componentMetrics] of components.entries()) {
          for (const [metricName, trackedMetric] of componentMetrics.entries()) {
            const name = `${system}-${component}-${metricName}`.replace(/-/g, '_')
            const labelName = trackedMetric.label ?? metricName.replace(/-/g, '_')
            const help = trackedMetric.help ?? metricName.replace(/-/g, '_')

            /** @type {client.GaugeConfiguration<any>} */
            const gaugeOptions = { name, help }
            const metricValue = await trackedMetric.calculate()

            if (typeof metricValue !== 'number') {
              // metric group
              gaugeOptions.labelNames = [
                labelName
              ]
            }

            if (!gauges[name]) {
              // create metric if it's not been seen before
              gauges[name] = new client.Gauge(gaugeOptions)
            }

            if (typeof metricValue !== 'number') {
              // metric group
              Object.entries(metricValue).forEach(([key, value]) => {
                gauges[name].set({ [labelName]: key }, value)
              })
            } else {
              // metric value
              gauges[name].set(metricValue)
            }
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
      disable()
    } else {
      enable(request.query.debug)
    }

    return h.response()
  }
}]
