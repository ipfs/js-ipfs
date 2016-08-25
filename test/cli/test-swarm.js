/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')
const HttpAPI = require('../../src/http-api')
const createTempNode = require('../utils/temp-node')
const repoPath = require('./index').repoPath
const _ = require('lodash')

describe('swarm', function () {
  this.timeout(30 * 1000)
  const env = _.clone(process.env)
  env.IPFS_PATH = repoPath

  var ipfs
  var ipfsAddr

  before((done) => {
    createTempNode(1, (err, _ipfs) => {
      expect(err).to.not.exist
      ipfs = _ipfs
      ipfs.goOnline((err) => {
        expect(err).to.not.exist
        ipfs.id((err, identity) => {
          expect(err).to.not.exist
          ipfsAddr = `${identity.addresses[0]}/ipfs/${identity.id}`
          done()
        })
      })
    })
  })

  describe('api running', () => {
    let httpAPI

    before((done) => {
      httpAPI = new HttpAPI(repoPath)
      httpAPI.start((err) => {
        expect(err).to.not.exist
        done()
      })
    })

    after((done) => {
      httpAPI.stop((err) => {
        expect(err).to.not.exist
        done()
      })
    })

    it('connect', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'swarm', 'connect', ipfsAddr], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          done()
        })
    })

    it.skip('peers', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'swarm', 'peers'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout).to.have.length.above(0)
          done()
        })
    })

    it.skip('addrs local', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'swarm', 'addrs', 'local'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout).to.have.length.above(0)
          done()
        })
    })
  })
})
