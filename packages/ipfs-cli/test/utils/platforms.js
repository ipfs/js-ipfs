'use strict'

const os = require('os')
const current = os.platform()

module.exports = {
  isWindows: current === 'win32',
  isMacOS: current === 'darwin',
  isLinux: current === 'linux'
}
