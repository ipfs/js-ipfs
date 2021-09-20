import { commands } from './dht/index.js'

export default {
  command: 'dht <command>',

  description: 'Issue commands directly through the DHT.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    // @ts-expect-error types are wrong
    return yargs.command(commands)
  }
}
