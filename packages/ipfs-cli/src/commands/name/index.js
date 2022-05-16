import namePublish from './publish.js'
import namePubsub from './pubsub.js'
import nameResolve from './resolve.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  namePublish,
  namePubsub,
  nameResolve
]
