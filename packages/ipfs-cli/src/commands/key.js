
export default {
  command: 'key <command>',

  description: 'Manage your keys',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      .commandDir('key')
  }
}
