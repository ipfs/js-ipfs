

export default {
  command: 'bitswap <command>',

  description: 'Interact with the bitswap agent.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs.commandDir('bitswap')
  }
}
