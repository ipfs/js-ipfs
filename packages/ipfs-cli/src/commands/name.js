import { commands } from './name/index.js'

/*
IPNS is a PKI namespace, where names are the hashes of public keys, and
the private key enables publishing new (signed) values. In both publish
and resolve, the default name used is the node's own PeerID,
which is the hash of its public key.
*/
export default {
  command: 'name <command>',

  description: 'Publish and resolve IPNS names.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    commands.forEach(command => {
      // @ts-ignore types are wrong
      yargs.command(command)
    })

    return yargs
  }
}
