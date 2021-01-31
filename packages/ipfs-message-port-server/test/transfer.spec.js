'use strict'

/* eslint-env mocha */
const { encodeCID } = require('ipfs-message-port-protocol/src/cid')

const CID = require('cids')
const { Server } = require('../src/server')
const { IPFSService } = require('../src/index')

describe('Server', function () {
  this.timeout(10 * 1000)

  it('should be able to transfer multiple of the same CID instances', () => {
    const cid = new CID('QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D')

    return new Promise((resolve, reject) => {
      const channel = process.browser
        ? new globalThis.MessageChannel()
        : new (require('worker_threads').MessageChannel)()

      channel.port1.onmessageerror = reject
      channel.port1.onmessage = event => {
        const result = event.data.result
        result.ok ? resolve(result.value) : reject(new Error(result.error.message))
      }

      const service = new IPFSService()
      const server = new Server(service)
      const transfer = []

      server.run = a => a
      server.handleQuery(
        '',
        {
          result: {
            value: [encodeCID(cid, transfer), encodeCID(cid, transfer)],
            transfer: transfer
          },
          signal: { aborted: false }
        },
        channel.port2
      )
    })
  })
})
