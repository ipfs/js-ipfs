import { createCmds } from './cmds.js'
import { createNet } from './net.js'
import { createSys } from './sys.js'

export class DiagAPI {
  /**
   * @param {import('../types').Options} config
   */
  constructor (config) {
    this.cmds = createCmds(config)
    this.net = createNet(config)
    this.sys = createSys(config)
  }
}
