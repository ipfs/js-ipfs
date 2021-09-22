/* eslint-env mocha, browser */

import { Multiaddr } from 'multiaddr'
import { expect } from 'aegir/utils/chai.js'
import { factory } from './utils/factory.js'
import { create as ipfsClient } from '../src/index.js'
import { isBrowser } from 'ipfs-utils/src/env.js'

const f = factory()

describe('ipfs-http-client constructor tests', () => {
  describe('parameter permuations', () => {
    it('none', () => {
      const ipfs = ipfsClient()
      if (typeof self !== 'undefined') {
        const { hostname, port } = self.location
        expectConfig(ipfs, { host: hostname, port })
      } else {
        expectConfig(ipfs, {})
      }
    })

    it('opts', () => {
      const host = 'wizard.world'
      const port = '999'
      const protocol = 'https'
      const ipfs = ipfsClient({ host, port, protocol })
      expectConfig(ipfs, { host, port, protocol })
    })

    it('opts with URL components from URL', () => {
      const host = 'wizard.world'
      const port = '999'
      const protocol = 'https'
      const url = new URL(`${protocol}://${host}:${port}`)
      const ipfs = ipfsClient({ host: url.host, port: url.port, protocol: url.protocol })
      expectConfig(ipfs, { host, port, protocol })
    })

    it('multiaddr dns4 string (implicit http)', () => {
      const host = 'foo.com'
      const port = '1001'
      const protocol = 'http' // default to http if not specified in multiaddr
      const addr = `/dns4/${host}/tcp/${port}`
      const ipfs = ipfsClient(addr)
      expectConfig(ipfs, { host, port, protocol })
    })

    it('multiaddr dns4 string (explicit https)', () => {
      const host = 'foo.com'
      const port = '1001'
      const protocol = 'https'
      const addr = `/dns4/${host}/tcp/${port}/${protocol}`
      const ipfs = ipfsClient(addr)
      expectConfig(ipfs, { host, port, protocol })
    })

    it('multiaddr ipv4 string (implicit http)', () => {
      const host = '101.101.101.101'
      const port = '1001'
      const protocol = 'http'
      const addr = `/ip4/${host}/tcp/${port}`
      const ipfs = ipfsClient(addr)
      expectConfig(ipfs, { host, port, protocol })
    })

    it('multiaddr ipv4 string (explicit https)', () => {
      const host = '101.101.101.101'
      const port = '1001'
      const protocol = 'https'
      const addr = `/ip4/${host}/tcp/${port}/${protocol}`
      const ipfs = ipfsClient(addr)
      expectConfig(ipfs, { host, port, protocol })
    })

    it('multiaddr instance', () => {
      const host = 'ace.place'
      const port = '1001'
      const addr = new Multiaddr(`/dns4/${host}/tcp/${port}`)
      const ipfs = ipfsClient(addr)
      expectConfig(ipfs, { host, port })
    })

    it('host and port strings', () => {
      const host = '1.1.1.1'
      const port = '9999'
      const ipfs = ipfsClient({ host, port })
      expectConfig(ipfs, { host, port })
    })

    it('URL as string', () => {
      const host = '10.100.100.255'
      const port = '9999'
      const apiPath = '/future/api/v1/'
      const ipfs = ipfsClient(`http://${host}:${port}${apiPath}`)
      expectConfig(ipfs, { host, port, apiPath })
    })

    it('URL as URL', () => {
      const host = '10.100.100.255'
      const port = '9999'
      const apiPath = '/future/api/v1/'
      const ipfs = ipfsClient(new URL(`http://${host}:${port}${apiPath}`))
      expectConfig(ipfs, { host, port, apiPath })
    })

    it('host, port and api path', () => {
      const host = '10.100.100.255'
      const port = '9999'
      const apiPath = '/future/api/v1/'
      const ipfs = ipfsClient({ host, port, apiPath })
      expectConfig(ipfs, { host, port, apiPath })
    })

    it('options.url as URL string', () => {
      const host = '10.100.100.255'
      const port = '9999'
      const apiPath = '/future/api/v1/'
      const ipfs = ipfsClient({ url: `http://${host}:${port}${apiPath}` })
      expectConfig(ipfs, { host, port, apiPath })
    })

    it('options.url as URL', () => {
      const host = '10.100.100.255'
      const port = '9999'
      const apiPath = '/future/api/v1/'
      const ipfs = ipfsClient({ url: new URL(`http://${host}:${port}${apiPath}`) })
      expectConfig(ipfs, { host, port, apiPath })
    })

    it('options.url as multiaddr (implicit http)', () => {
      const host = 'foo.com'
      const port = '1001'
      const protocol = 'http' // default to http if not specified in multiaddr
      const addr = `/dns4/${host}/tcp/${port}`
      const ipfs = ipfsClient({ url: new Multiaddr(addr) })
      expectConfig(ipfs, { host, port, protocol })
    })

    it('options.url as multiaddr (explicit https)', () => {
      const host = 'foo.com'
      const port = '1001'
      const protocol = 'https'
      const addr = `/dns4/${host}/tcp/${port}/https`
      const ipfs = ipfsClient({ url: new Multiaddr(addr) })
      expectConfig(ipfs, { host, port, protocol })
    })

    it('options.url as multiaddr string (implicit http)', () => {
      const host = 'foo.com'
      const port = '1001'
      const protocol = 'http' // default to http if not specified in multiaddr
      const addr = `/dns4/${host}/tcp/${port}`
      const ipfs = ipfsClient({ url: addr })
      expectConfig(ipfs, { host, port, protocol })
    })

    it('options.url as multiaddr string (explicit https)', () => {
      const host = 'foo.com'
      const port = '1001'
      const protocol = 'https'
      const addr = `/dns4/${host}/tcp/${port}/https`
      const ipfs = ipfsClient({ url: addr })
      expectConfig(ipfs, { host, port, protocol })
    })
  })

  describe('integration', () => {
    let ipfsd

    before(async function () {
      this.timeout(60 * 1000) // slow CI

      ipfsd = await f.spawn()
    })

    after(() => f.clean())

    it('can connect to an ipfs http api', async () => {
      await clientWorks(ipfsClient(ipfsd.apiAddr))
    })
  })
})

async function clientWorks (client) {
  const id = await client.id()

  expect(id).to.have.a.property('id')
  expect(id).to.have.a.property('publicKey')
}

function expectConfig (ipfs, { host, port, protocol, apiPath }) {
  const conf = ipfs.getEndpointConfig()
  if (protocol) {
    protocol = protocol + ':'
  }
  if (isBrowser) {
    expect(conf.host).to.be.oneOf([host, globalThis.location.hostname, ''])
    expect(conf.port).to.be.oneOf([port, globalThis.location.port, '80'])
    expect(conf.protocol).to.equal(protocol || 'http:')
    expect(conf.pathname).to.equal(apiPath || '/api/v0')
  } else {
    expect(conf.host).to.be.oneOf([host, 'localhost', ''])
    expect(conf.port).to.be.oneOf([port, '5001', '80'])
    expect(conf.protocol).to.equal(protocol || 'http:')
    expect(conf.pathname).to.equal(apiPath || '/api/v0')
  }
}
