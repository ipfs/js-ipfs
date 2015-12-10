var Command = require('ronin').Command
// var help = require('../src/help-menu.js')

module.exports = Command.extend({
  desc: 'Initialize ipfs local configuration',

  // help: help,

  options: {
    bits: {
      type: 'number',
      alias: 'b',
      default: '2048',
      desc: 'Number of bits to use in the generated RSA private key (defaults to 2048)'
    },
    force: {
      alias: 'f',
      type: 'boolean',
      desc: 'Overwrite existing config (if it exists)'
    },
    'empty-repo': {
      alias: 'e',
      type: 'boolean',
      desc: 'Don\'t add and pin help files to the local storage'
    }
  },

  run: function (name) {
    console.log('NA - https://github.com/ipfs/js-ipfs/tree/jsipfs#getting-jsipfs-ready')
  }
})
