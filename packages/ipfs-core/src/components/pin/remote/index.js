'use strict'

const createServiceApi = require('./service')
const createAdd = require('./add')
const createLs = require('./ls')
const createRm = require('./rm')
const createRmAll = require('./rmAll')

/**
 * PinRemoteAPI provides an API for pinning content to remote services.
 */
class PinRemoteAPI {
  /**
   * @param {Object} opts
   * @param {SwarmAPI} opts.swarm
   * @param {Config} opts.config
   * @param {PeerId} opts.peerId
   */
  constructor ({ swarm, config, peerId }) {
    const { service, serviceRegistry } = createServiceApi({ config, swarm, peerId })

    this.service = service
    this.add = createAdd({ serviceRegistry })
    this.ls = createLs({ serviceRegistry })
    this.rm = createRm({ serviceRegistry })
    this.rmAll = createRmAll({ serviceRegistry })
  }
}

/**
 * @typedef {import('../..').PeerId} PeerId
 * @typedef {import('../../swarm')} SwarmAPI
 * @typedef {import('../../config').Config} Config
 */

module.exports = PinRemoteAPI
