'use strict'

const path = require('path')
const {
  waitForOutput
} = require('test-ipfs-example/utils')

const testInProcessNode = async () => {
  await waitForOutput(
    'Put {"hello":"world"} = CID(bagn7ofysecj2eolrvekol2wl6cuneukuzwrqtq6by4x3xgiu2r6gb46lnakyq)\n' +
    'Get CID(bagn7ofysecj2eolrvekol2wl6cuneukuzwrqtq6by4x3xgiu2r6gb46lnakyq) = {"hello":"world"}', path.resolve(__dirname, 'in-process-node.js'))
}

const testDaemonNode = async () => {
  await waitForOutput(
    'Put {"hello":"world"} = CID(bagn7ofysecj2eolrvekol2wl6cuneukuzwrqtq6by4x3xgiu2r6gb46lnakyq)\n' +
    'Get CID(bagn7ofysecj2eolrvekol2wl6cuneukuzwrqtq6by4x3xgiu2r6gb46lnakyq) = {"hello":"world"}', path.resolve(__dirname, 'daemon-node.js'))
}

async function test () {
  console.info('Testing in-process node')
  await testInProcessNode()

  console.info('Testing daemon node')
  await testDaemonNode()
}

module.exports = test
