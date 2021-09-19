
import os from 'os'
const current = os.platform()

module.exports = {
  isWindows: current === 'win32',
  isMacOS: current === 'darwin',
  isLinux: current === 'linux'
}
