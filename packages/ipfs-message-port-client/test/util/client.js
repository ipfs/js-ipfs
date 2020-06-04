/* eslint-env browser */

'use strict'

const IPFSClient = require('../../src/index')

const activate = () => {
  const worker = new SharedWorker(process.env.IPFS_WORKER_URL, 'IPFSService')
  const client = IPFSClient.from(worker.port)
  return client
}
exports.activate = activate

const detached = () => {
  const client = IPFSClient.detached()
  return client
}
exports.detached = detached
