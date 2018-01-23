/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const os = require('os')

const IPFSApi = require('../src')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

describe('.diag', function () {
  this.timeout(50 * 1000)

  if (os.platform() === 'win32') {
    it('skip these on Windows')
    return
  }

  let ipfsd
  let ipfs

  before((done) => {
    df.spawn((err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = IPFSApi(_ipfsd.apiAddr)
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  describe('Callback API', () => {
    // Disabled in go-ipfs 0.4.10
    it.skip('.diag.net', (done) => {
      ipfs.diag.net((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        done()
      })
    })

    it('.diag.sys', (done) => {
      ipfs.diag.sys((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.have.a.property('memory')
        expect(res).to.have.a.property('diskinfo')
        done()
      })
    })

    it('.diag.cmds', (done) => {
      ipfs.diag.cmds((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        done()
      })
    })
  })

  describe('Promise API', () => {
    // Disabled in go-ipfs 0.4.10
    it.skip('.diag.net', () => {
      return ipfs.diag.net()
        .then((res) => expect(res).to.exist())
    })

    it('.diag.sys', () => {
      return ipfs.diag.sys()
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.have.a.property('memory')
          expect(res).to.have.a.property('diskinfo')
        })
    })

    it('.diag.cmds', () => {
      return ipfs.diag.cmds()
        .then((res) => expect(res).to.exist())
    })
  })
})
