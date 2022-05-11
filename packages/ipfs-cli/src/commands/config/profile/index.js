import configProfileApply from './apply.js'
import configProfileLs from './ls.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  configProfileApply,
  configProfileLs
]
