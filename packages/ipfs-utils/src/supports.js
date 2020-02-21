'use strict'

module.exports = {
  supportsFileReader: typeof self !== 'undefined' && 'FileReader' in self
}
