'use strict'

// The command count bump from 56 to 60 depends on:
// ipfs/interface-ipfs-core.git#5c7df414a8f627f8adb50a52ef8d2b629381285f
// ipfs/js-ipfs-api.git#01044a1f59fb866e4e08b06aae4e74d968615931
module.exports = {
  command: 'pubsub',

  description: 'pubsub commands',

  builder (yargs) {
    return yargs
      .commandDir('pubsub')
  },

  handler (argv) {}
}
