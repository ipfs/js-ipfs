import { createCmds } from './cmds.js'
import { createNet } from './net.js'
import { createSys } from './sys.js'

/**
 * @param {import('../types').Options} config
 */
export function createDiag (config) {
  return {
    cmds: createCmds(config),
    net: createNet(config),
    sys: createSys(config)
  }
}
