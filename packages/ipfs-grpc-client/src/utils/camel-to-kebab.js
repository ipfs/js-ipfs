'use strict'

/**
 * @param {string} string - e.g. 'fooBar'
 * @returns {string} - e.g. 'foo-bar'
 **/
module.exports = function camelToKebab (string) {
  return string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
}
