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
  ID: 'QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A',
  PublicKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC2SKo/HMFZeBml1AF3XijzrxrfQXdJzjePBZAbdxqKR1Mc6juRHXij6HXYPjlAk01BhF1S3Ll4Lwi0cAHhggf457sMg55UWyeGKeUv0ucgvCpBwlR5cQ020i0MgzjPWOLWq1rtvSbNcAi2ZEVn6+Q2EcHo3wUvWRtLeKz+DZSZfw2PEDC+DGPJPl7f8g7zl56YymmmzH9liZLNrzg/qidokUv5u1pdGrcpLuPNeTODk0cqKB+OUbuKj9GShYECCEjaybJDl9276oalL9ghBtSeEv20kugatTvYy590wFlJkkvyl+nPxIH0EEYMKK9XRWlu9XYnoSfboiwcv8M3SlsjAgMBAAE=',
  Addresses: ['/ip4/0.0.0.0/tcp/0'],
  AgentVersion: 'js-ipfs',
  ProtocolVersion: '9000'
}
