import { commands } from './name/index.js'

/*
IPNS is a PKI namespace, where names are the hashes of public keys, and
the private key enables publishing new (signed) values. In both publish
and resolve, the default name used is the node's own PeerID,
which is the hash of its public key.
*/
/** @type {import('yargs').CommandModule} */
const command = {
  command: 'name <command>',

  describe: 'Publish and resolve IPNS names',

  builder (yargs) {
    commands.forEach(command => {
      yargs.command(command)
    })

    return yargs
  },

  handler () {

  }
}

export default command
