/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')
const Block = require('ipfs-block')
const _ = require('lodash')
const bs58 = require('bs58')

const HttpAPI = require('../../src/http-api')
const createTempNode = require('../utils/temp-node')
const repoPath = require('./index').repoPath

describe('bitswap', function () {
  this.timeout(20000)
  const env = _.clone(process.env)
  env.IPFS_PATH = repoPath

  let ipfs

  before((done) => {
    createTempNode(4, (err, _ipfs) => {
      expect(err).to.not.exist
      ipfs = _ipfs
      ipfs.goOnline(done)
    })
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

    it('wantlist', (done) => {
      const api = httpAPI.server.select('API')

      api.inject({
        method: 'GET',
        url: `/api/v0/block/get?arg=${key}`
      }, (res) => {})

      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'bitswap', 'wantlist'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          // expect(exitcode).to.equal(0)
          expect(stdout).to.be.eql([
            key
          ])
          done()
        })
    })

    it('stat', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'bitswap', 'stat'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout).to.be.eql([
            'bitswap status',
            '  blocks received: 0',
            '  dup blocks received: 0',
            '  dup data received: 0B',
            '  wantlist [1 keys]',
            `    ${key}`,
            '  partners [0]',
            '    '
          ])
          done()
        })
    })
  })
})
