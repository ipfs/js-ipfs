'use strict'

const spawn = require('child_process').spawn
const path = require('path')
const newLineParser = require('new-line')

exports = module.exports

exports.spawnNode = (transports, callback) => {
  const filePath = path.join(__dirname, './ipfs-node.js')
  const nodeProc = spawn(filePath, [])

  let count = 0
  const nls = newLineParser()

  nodeProc.stdout.pipe(nls)

  nls.on('line', (data) => {
    if (count++ === 0) { return }
    const nodeInfo = JSON.parse(data.toString())
    callback(null, {
      nodeInfo: nodeInfo,
      nodeProc: nodeProc,
      sigterm: () => {},
      sigkill: () => { nodeProc.kill('SIGKILL') }
    })
  })
}
