/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const Daemon = require('../')
const fetch = require('node-fetch')

describe('daemon', () => {
  let daemon

  it('should start a http api server', async () => {
    daemon = new Daemon({})

    await daemon.start()

    const {
      uri
    } = daemon._httpApi._apiServers[0].info

    const httpId = (await fetch(`${uri}/api/v0/id`, {
      method: 'POST'
    })).json()

    const apiId = await daemon._ipfs.id()

    await expect(httpId).to.eventually.have.property('PublicKey', apiId.publicKey)

    await daemon.stop()
  })

  it('should start a http gateway server', async () => {
    daemon = new Daemon({})

    await daemon.start()

    const {
      uri
    } = daemon._httpGateway._gatewayServers[0].info

    const result = await (await fetch(`${uri}/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn`, {
      method: 'POST'
    })).text()

    expect(result).to.include('Index of /ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn/')

    await daemon.stop()
  })

  it('should stop', async () => {
    daemon = new Daemon({})

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
