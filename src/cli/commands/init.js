const Command = require('ronin').Command

module.exports = Command.extend({
  desc: 'Initialize ipfs local configuration',

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
      desc: "Don't add and pin help files to the local storage"
    }
  },

  run: () => {}
})
