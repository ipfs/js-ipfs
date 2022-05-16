import bootstrapAdd from './add.js'
import bootstrapList from './list.js'
import bootstrapRm from './rm.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  bootstrapAdd,
  bootstrapList,
  bootstrapRm
]
