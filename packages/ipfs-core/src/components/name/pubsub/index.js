'use strict'

const createCancelAPI = require('./cancel')
const createStateAPI = require('./state')
const createSubsAPI = require('./subs')

class PubSubAPI {
  /**
   * @param {Object} config
   * @param {import('../../ipns')} config.ipns
   * @param {import('../../../types').Options} config.options
   */
  constructor ({ ipns, options }) {
    this.cancel = createCancelAPI({ ipns, options })
    this.state = createStateAPI({ ipns, options })
    this.subs = createSubsAPI({ ipns, options })
  }
}
module.exports = PubSubAPI
