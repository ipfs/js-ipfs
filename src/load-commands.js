'use strict'

const isNode = !global.window

function requireDir () {
  if (isNode) return require('require-dir')('./api')

  // Webpack specific require of a directory
  const req = require.context('./api', false, /\.js$/)

  const files = {}
  req.keys().forEach(key => {
    const name = key
      .replace(/^\.\//, '')
      .replace(/\.js$/, '')
    files[name] = req(key)
  })

  return files
}

function loadCommands (send) {
  const files = requireDir()
  const cmds = {}

  Object.keys(files).forEach(file => {
    cmds[file] = files[file](send)
  })

  return cmds
}

module.exports = loadCommands
