/* eslint-env mocha, browser */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const Multiaddr = require('multiaddr')
const { isBrowser, isWebWorker } = require('ipfs-utils/src/env')
const configure = require('../src/lib/configure')

describe('lib/configure', () => {
  it('should accept no config', () => {
    configure(config => {
      if (isBrowser || isWebWorker) {
        expect(config.apiAddr).to.eql(location.origin)
      } else {
        expect(config.apiAddr).to.eql('http://localhost:5001')
      }
    })()
  })

  it('should accept string multiaddr', () => {
    const input = '/ip4/127.0.0.1/tcp/5001'
    configure(config => {
      expect(config.apiAddr).to.eql('http://127.0.0.1:5001')
    })(input)
  })

  it('should accept string url', () => {
    const input = 'http://127.0.0.1:5001'
    configure(config => {
      expect(config.apiAddr).to.eql('http://127.0.0.1:5001')
    })(input)
  })

  it('should accept multiaddr instance', () => {
    const input = Multiaddr('/ip4/127.0.0.1/tcp/5001')
    configure(config => {
      expect(config.apiAddr).to.eql('http://127.0.0.1:5001')
    })(input)
  })

  it('should accept object with protocol, host and port', () => {
    const input = { protocol: 'https', host: 'ipfs.io', port: 138 }
    configure(config => {
      expect(config.apiAddr).to.eql('https://ipfs.io:138')
    })(input)
  })

  it('should accept object with protocol only', () => {
    const input = { protocol: 'https' }
    configure(config => {
      if (isBrowser || isWebWorker) {
        expect(config.apiAddr).to.eql(`https://${location.host}`)
      } else {
        expect(config.apiAddr).to.eql('https://localhost:5001')
      }
    })(input)
  })

  it('should accept object with host only', () => {
    const input = { host: 'ipfs.io' }
    configure(config => {
      if (isBrowser || isWebWorker) {
        expect(config.apiAddr).to.eql(`http://ipfs.io:${location.port}`)
      } else {
        expect(config.apiAddr).to.eql('http://ipfs.io:5001')
      }
    })(input)
  })

  it('should accept object with port only', () => {
    const input = { port: 138 }
    configure(config => {
      if (isBrowser || isWebWorker) {
        expect(config.apiAddr).to.eql(`http://${location.hostname}:138`)
      } else {
        expect(config.apiAddr).to.eql('http://localhost:138')
      }
    })(input)
  })
})
