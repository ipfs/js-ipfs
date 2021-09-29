/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { Daemon } from '../src/index.js'
import fetch from 'node-fetch'
import WebSocket from 'ws'
import os from 'os'

function createDaemon () {
  return new Daemon({
    init: {
      bits: 512
    },
    repo: `${os.tmpdir()}/ipfs-test-${Math.random()}`,
    config: {
      Addresses: {
        Swarm: [],
        API: '/ip4/127.0.0.1/tcp/0',
        Gateway: '/ip4/127.0.0.1/tcp/0',
        RPC: '/ip4/127.0.0.1/tcp/0'
      }
    }
  })
}

describe('daemon', function () {
  // slow ci is slow
  this.timeout(60 * 1000)

  let daemon

  it('should start a http api server', async () => {
    daemon = createDaemon()

    await daemon.start()

    const {
      uri
    } = daemon._httpApi._apiServers[0].info

    const idFromCore = await daemon._ipfs.id()

    const httpId = await fetch(`${uri}/api/v0/id`, {
      method: 'POST'
    })

    await expect(httpId.json()).to.eventually.have.property('PublicKey', idFromCore.publicKey)

    await daemon.stop()
  })

  it('should start a http gateway server', async () => {
    daemon = createDaemon()

    await daemon.start()

    const {
      uri
    } = daemon._httpGateway._gatewayServers[0].info

    const result = await fetch(`${uri}/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn`, {
      method: 'POST'
    })

    await expect(result.text()).to.eventually.include('Index of /ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn/')

    await daemon.stop()
  })

  it('should start a gRPC server', async () => {
    daemon = createDaemon()

    await daemon.start()

    const {
      uri
    } = daemon._grpcServer.info

    const socket = new WebSocket(`${uri}/ipfs.Root/id`)
    let received = Buffer.alloc(0)

    await new Promise((resolve) => {
      socket.on('open', () => {
        socket.send(Buffer.from('Y29udGVudC10eXBlOiBhcHBsaWNhdGlvbi9ncnBjLXdlYitwcm90bw0KeC1ncnBjLXdlYjogMQ0K', 'base64'))
        socket.send(Buffer.from('AAAAAAAA', 'base64'))
      })

      socket.on('message', (data) => {
        received = Buffer.concat([received, data], received.byteLength + data.byteLength)
      })

      socket.on('close', () => {
        resolve()
      })
    })

    const apiId = await daemon._ipfs.id()

    // don't try to decode protobuf, just look for embedded string
    expect(received.toString('utf8')).to.include(apiId.id)

    await daemon.stop()
  })

  it('should stop', async () => {
    daemon = createDaemon()

    await daemon.start()
    await daemon.stop()

    const {
      uri
    } = daemon._httpApi._apiServers[0].info

    await expect(fetch(`${uri}/api/v0/id`, {
      method: 'POST'
    })).to.eventually.be.rejectedWith(/ECONNREFUSED/)
  })
})
