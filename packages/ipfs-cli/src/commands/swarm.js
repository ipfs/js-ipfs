import { commands } from './swarm/index.js'

export default {
  command: 'swarm <command>',

  description: 'Swarm inspection tool.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      // @ts-expect-error types are wrong
      .command(commands)
  }
}
