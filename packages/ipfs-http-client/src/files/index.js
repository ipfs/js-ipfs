import { createChmod } from './chmod.js'
import { createCp } from './cp.js'
import { createFlush } from './flush.js'
import { createLs } from './ls.js'
import { createMkdir } from './mkdir.js'
import { createMv } from './mv.js'
import { createRead } from './read.js'
import { createRm } from './rm.js'
import { createStat } from './stat.js'
import { createTouch } from './touch.js'
import { createWrite } from './write.js'

export class FilesAPI {
  /**
   * @param {import('../types').Options} config
   */
  constructor (config) {
    this.chmod = createChmod(config)
    this.cp = createCp(config)
    this.flush = createFlush(config)
    this.ls = createLs(config)
    this.mkdir = createMkdir(config)
    this.mv = createMv(config)
    this.read = createRead(config)
    this.rm = createRm(config)
    this.stat = createStat(config)
    this.touch = createTouch(config)
    this.write = createWrite(config)
  }
}
