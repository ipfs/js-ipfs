'use strict'

const Command = require('ronin').Command
const path = require('path')
const ronin = require('ronin')

module.exports = Command.extend({
  desc: '',

  run: (name) => {
    const cli = ronin(path.resolve(__dirname, '..'))

    cli.setupCommands()

    const commands = ['']
      .concat(Object.keys(cli.commands))
      .map((command) => 'ipfs ' + command)
      .join('\n')

    console.log(commands)
  }
})
