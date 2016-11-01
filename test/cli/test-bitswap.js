/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const Block = require('ipfs-block')
const bs58 = require('bs58')

const HttpAPI = require('../../src/http-api')
const createTempNode = require('../utils/temp-node')
const repoPath = require('./index').repoPath
const ipfs = require('../utils/ipfs-exec')(repoPath)

describe.skip('bitswap', () => {
  let node

  before((done) => {
    createTempNode(38, (err, _node) => {
      expect(err).to.not.exist
      node = _node
      node.goOnline(done)
    })
  })

  after((done) => {
    node.goOffline(done)
  })

  describe('api running', () => {
    const block = new Block('hello')
    const key = bs58.encode(block.key)
    let httpAPI

    before((done) => {
      httpAPI = new HttpAPI(repoPath)
      httpAPI.start(done)
    })

    after((done) => {
      httpAPI.stop(done)
    })

    it('wantlist', () => {
      const api = httpAPI.server.select('API')

      api.inject({
        method: 'GET',
        url: `/api/v0/block/get?arg=${key}`
      }, () => {})

      return ipfs('bitswap wantlist').then((out) => {
        expect(out).to.be.eql(key)
      })
    })

    it('stat', () => {
      return ipfs('bitswap stat').then((out) => {
        expect(out).to.be.eql([
          'bitswap status',
          '  blocks received: 0',
          '  dup blocks received: 0',
          '  dup data received: 0B',
          '  wantlist [1 keys]',
          `    ${key}`,
          '  partners [0]',
          '    '
        ].join('\n'))
      })
    })
  })
})
