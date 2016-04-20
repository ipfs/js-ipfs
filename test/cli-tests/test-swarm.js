/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')
const httpAPI = require('../../src/http-api')
const createTempNode = require('../utils/temp-node')
const repoPath = require('./index').repoPath

describe('swarm', function () {
  this.timeout(20000)
  const env = process.env
  env.IPFS_PATH = repoPath

  var ipfs
  var ipfsAddr

  before((done) => {
    createTempNode(8, (err, _ipfs) => {
      expect(err).to.not.exist
      ipfs = _ipfs
      ipfs.libp2p.start(done)
    })
  })

  before((done) => {
    ipfs.id((err, res) => {
      expect(err).to.not.exist
      ipfsAddr = `${res.Addresses[0]}/ipfs/${res.ID}`
      done()
    })
  })

  describe('api running', () => {
    before((done) => {
      httpAPI.start(repoPath, (err) => {
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

    it('peers', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'swarm', 'peers'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout).to.have.length.above(0)
          done()
        })
    })

    it('addrs local', (done) => {
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
