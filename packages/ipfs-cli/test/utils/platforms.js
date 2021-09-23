
import os from 'os'

const current = os.platform()

export const isWindows = current === 'win32'
export const isMacOS = current === 'darwin'
export const isLinux = current === 'linux'
