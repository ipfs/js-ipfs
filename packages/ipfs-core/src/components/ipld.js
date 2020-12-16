'use strict'

const getDefaultIpldOptions = require('../runtime/ipld')
const Ipld = require('ipld')

/**
 * @param {Object} config
 * @param {BlockService} config.blockService
 * @param {Print} config.print
 * @param {Options} [config.options]
 * @returns {IPLD}
 */
const createIPLD = ({ blockService, print, options }) =>
  new Ipld(getDefaultIpldOptions(blockService, options, print))
module.exports = createIPLD

/**
 * @typedef {import('ipfs-interface/src/ipld').IPLD} IPLD
 * @typedef {import('ipfs-interface/src/ipld').Options} Options
 * @typedef {import('ipfs-interface/src/block-service').BlockService} BlockService
 * @typedef {import('ipfs-interface/src/block-service').Block} Block
 * @typedef {import('.').Print} Print
 */
