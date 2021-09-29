
/* eslint-env mocha */

import { encodeCID } from 'ipfs-message-port-protocol/cid'
import { CID } from 'multiformats/cid'
import { Server } from '../src/server.js'
import { IPFSService } from '../src/index.js'
import { MessageChannel } from 'worker_threads'

describe('Server', function () {
  this.timeout(10 * 1000)

  it('should be able to transfer multiple of the same CID instances', () => {
    const cid = CID.parse('QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D')

    return new Promise((resolve, reject) => {
      const channel = globalThis.MessageChannel
        ? new globalThis.MessageChannel()
        : new MessageChannel()

      channel.port1.onmessageerror = reject
      channel.port1.onmessage = event => {
        channel.port1.close()
        channel.port2.close()

        const result = event.data.result
        result.ok ? resolve(result.value) : reject(new Error(result.error.message))
      }

      const service = new IPFSService()
      const server = new Server(service)
      const transfer = new Set()

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
