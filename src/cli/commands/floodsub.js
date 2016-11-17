'use strict'

// NOTE: Floodsub CLI is not tested. Tests will not be run until
// https://github.com/ipfs/js-ipfs-api/pull/377
// is merged
module.exports = {
  command: 'floodsub',

  description: 'floodsub commands',

  builder (yargs) {
    return yargs
      .commandDir('floodsub')
  },

  handler (argv) {}
}
