/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')
const HttpAPI = require('../../src/http-api')
const repoPath = require('./index').repoPath
const _ = require('lodash')

describe('id', () => {
  const env = _.clone(process.env)
  env.IPFS_PATH = repoPath

  describe('api offline', () => {
    it('get the id', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'id'], {env})
        .run((err, stdout, exitcode) => {
          expect(
            stdout
          ).to.be.eql([
            '{',
            '  "ID": "QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A",',
            '  "PublicKey": "CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC2SKo/HMFZeBml1AF3XijzrxrfQXdJzjePBZAbdxqKR1Mc6juRHXij6HXYPjlAk01BhF1S3Ll4Lwi0cAHhggf457sMg55UWyeGKeUv0ucgvCpBwlR5cQ020i0MgzjPWOLWq1rtvSbNcAi2ZEVn6+Q2EcHo3wUvWRtLeKz+DZSZfw2PEDC+DGPJPl7f8g7zl56YymmmzH9liZLNrzg/qidokUv5u1pdGrcpLuPNeTODk0cqKB+OUbuKj9GShYECCEjaybJDl9276oalL9ghBtSeEv20kugatTvYy590wFlJkkvyl+nPxIH0EEYMKK9XRWlu9XYnoSfboiwcv8M3SlsjAgMBAAE=",',
            '  "Addresses": [',
            '    "/ip4/127.0.0.1/tcp/9990/ws",',
            '    "/ip4/127.0.0.1/tcp/9999"',
            '  ],',
            '  "AgentVersion": "js-ipfs",',
            '  "ProtocolVersion": "9000"',
            '}'
          ])

          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          done()
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

    it('get the id', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'id'], {env})
        .run((err, stdout, exitcode) => {
          expect(
            stdout
          ).to.be.eql([
            '{',
            '  "ID": "QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A",',
            '  "PublicKey": "CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC2SKo/HMFZeBml1AF3XijzrxrfQXdJzjePBZAbdxqKR1Mc6juRHXij6HXYPjlAk01BhF1S3Ll4Lwi0cAHhggf457sMg55UWyeGKeUv0ucgvCpBwlR5cQ020i0MgzjPWOLWq1rtvSbNcAi2ZEVn6+Q2EcHo3wUvWRtLeKz+DZSZfw2PEDC+DGPJPl7f8g7zl56YymmmzH9liZLNrzg/qidokUv5u1pdGrcpLuPNeTODk0cqKB+OUbuKj9GShYECCEjaybJDl9276oalL9ghBtSeEv20kugatTvYy590wFlJkkvyl+nPxIH0EEYMKK9XRWlu9XYnoSfboiwcv8M3SlsjAgMBAAE=",',
            '  "Addresses": [',
            '    "/ip4/127.0.0.1/tcp/9990/ws",',
            '    "/ip4/127.0.0.1/tcp/9999"',
            '  ],',
            '  "AgentVersion": "js-ipfs",',
            '  "ProtocolVersion": "9000"',
            '}'
          ])

          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          done()
        })
    })
  })
})
