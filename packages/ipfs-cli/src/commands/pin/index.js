import pinAdd from './add.js'
import pinLs from './ls.js'
import pinRm from './rm.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  pinAdd,
  pinLs,
  pinRm
]
