/* eslint-disable max-depth */

import client from 'prom-client'
import Boom from '@hapi/boom'
import { disable, enable } from '@libp2p/logger'

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
