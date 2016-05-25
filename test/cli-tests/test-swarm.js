/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')
const HttpAPI = require('../../src/http-api')
const createTempNode = require('../utils/temp-node')
const repoPath = require('./index').repoPath
const _ = require('lodash')

describe('swarm', function () {
  this.timeout(80000)
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
        ipfs.id((err, res) => {
          expect(err).to.not.exist
          ipfsAddr = `${res.Addresses[0]}/ipfs/${res.ID}`
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
