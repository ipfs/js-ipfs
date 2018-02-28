'use strict'

const os = require('os')
const current = os.platform()

module.exports = {
  isWindows: () => {
    return current === 'win32'
  },
  isMacOS: () => {
    return current === 'darwin'
  },
  isLinux: () => {
    return current === 'linux'
  }
}
