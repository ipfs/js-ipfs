
export default {
  command: 'repo <command>',

  description: 'Manipulate the IPFS repo.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      .commandDir('repo')
  }
}
