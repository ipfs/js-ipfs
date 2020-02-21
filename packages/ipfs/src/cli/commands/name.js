'use strict'

/*
IPNS is a PKI namespace, where names are the hashes of public keys, and
the private key enables publishing new (signed) values. In both publish
and resolve, the default name used is the node's own PeerID,
which is the hash of its public key.
*/
module.exports = {
  command: 'name <command>',

  description: 'Publish and resolve IPNS names.',

  builder (yargs) {
    return yargs.commandDir('name')
  },

  handler (argv) {
  }
}
