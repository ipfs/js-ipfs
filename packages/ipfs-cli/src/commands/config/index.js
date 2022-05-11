import configEdit from './edit.js'
import configProfile from './profile.js'
import configReplace from './replace.js'
import configShow from './show.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  configEdit,
  configProfile,
  configReplace,
  configShow
]
