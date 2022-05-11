import namePubsubCancel from './cancel.js'
import namePubsubState from './state.js'
import namePubsubSubs from './subs.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  namePubsubCancel,
  namePubsubState,
  namePubsubSubs
]
