/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const ncp = require('ncp').ncp
const rimraf = require('rimraf')
const waterfall = require('async/waterfall')
const path = require('path')

const isWindows = require('../utils/platforms').isWindows
const skipOnWindows = isWindows() ? describe.skip : describe

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ exec: 'src/cli/bin.js' })

skipOnWindows('id endpoint', () => {
  const repoExample = path.join(__dirname, '../fixtures/go-ipfs-repo')
  const repoPath = path.join(__dirname, '../repo-tests-run')

  let ipfs = null
  let ipfsd = null
  before(function (done) {
    this.timeout(20 * 1000)

    ncp(repoExample, repoPath, (err) => {
      expect(err).to.not.exist()

      waterfall([
        (cb) => df.spawn({
          repoPath: repoPath,
          initOptions: { bits: 512 },
          config: { Bootstrap: [] },
          disposable: false,
          start: true
        }, cb),
        (_ipfsd, cb) => {
          ipfsd = _ipfsd
          ipfsd.start(cb)
        }
      ], (err) => {
        expect(err).to.not.exist()
        ipfs = ipfsd.api
        done()
      })
    })
  })

  after((done) => {
    rimraf(repoPath, (err) => {
      expect(err).to.not.exist()
      ipfsd.stop(done)
    })
  })

  describe('.id', () => {
    it('get the identity', (done) => {
      ipfs.id((err, result) => {
        expect(err).to.not.exist()
        expect(result.id).to.equal(idResult.ID)
        expect(result.publicKey).to.equal(idResult.PublicKey)
        const agentComponents = result.agentVersion.split('/')
        expect(agentComponents).lengthOf.above(1)
        expect(agentComponents[0]).to.equal(idResult.AgentVersion)
        expect(result.protocolVersion).to.equal(idResult.ProtocolVersion)
        done()
      })
    })
  })
})

const idResult = {
  ID: 'QmTuh8pVDCz5kbShrK8MJsJgTycCcGwZm8hQd8SxdbYmby',
  PublicKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCiyLgGRpuGiorm6FzvBbrTU60e6iPMmwXL9mXyGitepQyeN7XF8e6cooFeJI/NIyvbmpa7rHCDzTWP+6ebIMOXjUjQDAgaYdHywKbAXi2cgh96yuTN+cfPJ0IVA1/4Xsn/mnaMmSNDxqnK3fExEDxZizL9iI7KQCGOHociwjNj2cqaz+4ldTQ6QBbqa8nBMbulUNtSzwihQHTHNVwhuYFGPXIIK8UhM1VR20HcCbX+TZ9RpBWLIGZgjJl2ClW7wLW1OAb55I/9CK6AmfOriVYSBxZSFi2jiPCGQmuzfiqEke6/hSZtxe8DRo8ELOQ9K2P3L27H2az2atis2FoqVY2LAgMBAAE=',
  Addresses: ['/ip4/0.0.0.0/tcp/0'],
  AgentVersion: 'js-ipfs',
  ProtocolVersion: '9000'
}
