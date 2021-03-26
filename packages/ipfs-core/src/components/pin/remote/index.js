'use strict'

const PinRemoteServiceAPI = require('./service')
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
    this.swarm = swarm
    this.service = new PinRemoteServiceAPI({ config, swarm, peerId })

    // TODO: remove this.service & this.swarm once everything is refactored
    const remotePinServices = this.service
    this.add = createAdd({ remotePinServices })
    this.ls = createLs({ remotePinServices })
    this.rm = createRm({ remotePinServices })
    this.rmAll = createRmAll({ remotePinServices })
  }
}

/**
 * @typedef {import('../..').PeerId} PeerId
 * @typedef {import('../../swarm')} SwarmAPI
 * @typedef {import('../../config').Config} Config
 */

module.exports = PinRemoteAPI
