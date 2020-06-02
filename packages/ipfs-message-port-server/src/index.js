'use strict'

/* eslint-env browser */

const { Server } = require('./server')
const { DAG } = require('./dag')
const { Core } = require('./core')
const { Files } = require('./files')

/**
 * @typedef {import('./ipfs').IPFS} IPFS
 */

class IPFSService extends Core {
  /**
   *
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    super(ipfs)
    this.dag = new DAG(ipfs)
    this.files = new Files(ipfs)
  }
}

exports.IPFSService = IPFSService

/**
 * @param {IPFS} ipfs
 * @returns {Promise<void>}
 */
const main = async function (ipfs) {
  const service = new IPFSService(ipfs)
  const server = new Server(service)

  const controller = new AbortController()

  const result = await server.execute({
    namespace: 'dag',
    method: 'get',
    input: {
      cid: 'foo',
      path: '/foo',
      localResolve: true
    },
    signal: controller.signal
  })
  // eslint-disable-next-line no-console
  console.log(result)

  const added = await server.execute({
    method: 'add',
    input: {
      input: 'hello'
    }
  })
  // eslint-disable-next-line no-console
  console.log(added)

  const dag = new Server(service.dag)
  dag.execute({
    method: 'get',
    input: {
      cid: 'foo',
      path: '/foo',
      localResolve: true
    },
    signal: controller.signal
  })
}

exports.main = main
