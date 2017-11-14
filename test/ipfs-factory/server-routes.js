'use strict'

const SocketIO = require('socket.io')
const DaemonSpawner = require('./daemon-spawner')

module.exports = (http) => {
  const io = new SocketIO(http.listener)
  io.on('connection', handle)
  io.on('error', (err) => this.emit('error', err))

  const ds = new DaemonSpawner()

  function handle (socket) {
    socket.on('fs-spawn-node', spawnNode.bind(socket))
    socket.on('fs-dismantle', dismantle.bind(socket))
  }

  function spawnNode (repoPath, config) {
    ds.spawnNode(repoPath, config, (err, apiAddr) => {
      if (err) {
        return this.emit('error', err)
      }
      this.emit('fc-node', apiAddr.toString())
    })
  }

  function dismantle () {
    ds.dismantle((err) => {
      if (err) {
        return this.emit('error', err)
      }
      this.emit('fc-nodes-shutdown')
    })
  }
}
