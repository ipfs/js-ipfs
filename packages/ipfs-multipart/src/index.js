'use strict'

const content = require('@hapi/content')
const parser = require('./parser')

/**
 * Request Parser
 *
 * @param {Object} req - Request
 * @param {Object} options - Options passed to stream constructors
 * @returns {Object} an async iterable
 */
module.exports = (req, options = {}) => {
  options.boundary = content.type(req.headers['content-type']).boundary

  return parser(req.payload || req, options)
}
