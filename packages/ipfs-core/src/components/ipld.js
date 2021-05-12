'use strict'

const getDefaultIpldOptions = require('../runtime/ipld')
const Ipld = require('ipld')

/**
 * @param {Object} config
 * @param {import('ipfs-block-service')} config.blockService
 * @param {Partial<import('ipld').Options>} [config.options]
 */
const createIPLD = ({ blockService, options }) => {
  return new Ipld(getDefaultIpldOptions(blockService, options))
}

module.exports = createIPLD
