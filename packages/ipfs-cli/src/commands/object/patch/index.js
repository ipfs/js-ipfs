import objectPatchAddLink from './add-link.js'
import objectPatchAppendData from './append-data.js'
import objectPatchRmLink from './rm-link.js'
import objectPatchSetData from './set-data.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  objectPatchAddLink,
  objectPatchAppendData,
  objectPatchRmLink,
  objectPatchSetData
]
