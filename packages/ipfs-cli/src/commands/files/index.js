import filesChmod from './chmod.js'
import filesCp from './cp.js'
import filesFlush from './flush.js'
import filesLs from './ls.js'
import filesMkdir from './mkdir.js'
import filesMv from './mv.js'
import filesRead from './read.js'
import filesRm from './rm.js'
import filesStat from './stat.js'
import filesTouch from './touch.js'
import filesWrite from './write.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  filesChmod,
  filesCp,
  filesFlush,
  filesLs,
  filesMkdir,
  filesMv,
  filesRead,
  filesRm,
  filesStat,
  filesTouch,
  filesWrite
]
