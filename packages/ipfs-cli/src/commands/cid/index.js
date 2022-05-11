import cidBase32 from './base32.js'
import cidBases from './bases.js'
import cidCodecs from './codecs.js'
import cidFormat from './format.js'
import cidHashes from './hashes.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  cidBase32,
  cidBases,
  cidCodecs,
  cidFormat,
  cidHashes
]
