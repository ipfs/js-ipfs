'use strict'

const path = require('path')
const glob = require('glob').sync

module.exports = {
  command: 'commands',

  describe: 'List all available commands',

  handler ({ print }) {
    const basePath = path.resolve(__dirname, '..')

    // modeled after https://github.com/vdemedes/ronin/blob/master/lib/program.js#L78
    const files = glob(path.join(basePath, 'commands', '**', '*.js'))
    const cmds = files.map((p) => {
      return p.replace(/\//g, path.sep)
        .replace(/^./, ($1) => $1.toUpperCase())
        .replace(path.join(basePath, 'commands'), '')
        .replace(path.sep, '')
        .split(path.sep)
        .join(' ')
        .replace('.js', '')
    }).sort().map((cmd) => `ipfs ${cmd}`)

    print(['ipfs'].concat(cmds).join('\n'))
  }
}
