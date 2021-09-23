/* eslint-env browser */

import { IPFSClient } from '../../src/index.js'

export const activate = () => {
  const worker = new SharedWorker(process.env.IPFS_WORKER_URL, 'IPFSService')
  const client = IPFSClient.from(worker.port)
  return client
}

export const detached = () => {
  const client = IPFSClient.detached()
  return client
}
