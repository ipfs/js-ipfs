import statsBitswap from './bitswap.js'
import statsBw from './bw.js'
import statsRepo from './repo.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  statsBitswap,
  statsBw,
  statsRepo
]
