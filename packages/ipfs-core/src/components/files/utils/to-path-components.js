'use strict'

/**
 * @param {string} [path]
 */
const toPathComponents = (path = '') => {
  // split on / unless escaped with \
  return (path
    .trim()
    .match(/([^\\^/]|\\\/)+/g) || [])
    .filter(Boolean)
}

module.exports = toPathComponents
