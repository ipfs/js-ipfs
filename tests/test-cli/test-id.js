/* eslint-env mocha */

const expect = require('chai').expect
const nexpect = require('nexpect')
const httpAPI = require('../../src/http-api')

describe('id', () => {
  describe('api offline', () => {
    it('get the id', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'id'])
        .run((err, stdout, exitcode) => {
          var expected = [ "{ ID: 'QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A',",
            "  PublicKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC2SKo/HMFZeBml1AF3XijzrxrfQXdJzjePBZAbdxqKR1Mc6juRHXij6HXYPjlAk01BhF1S3Ll4Lwi0cAHhggf457sMg55UWyeGKeUv0ucgvCpBwlR5cQ020i0MgzjPWOLWq1rtvSbNcAi2ZEVn6+Q2EcHo3wUvWRtLeKz+DZSZfw2PEDC+DGPJPl7f8g7zl56YymmmzH9liZLNrzg/qidokUv5u1pdGrcpLuPNeTODk0cqKB+OUbuKj9GShYECCEjaybJDl9276oalL9ghBtSeEv20kugatTvYy590wFlJkkvyl+nPxIH0EEYMKK9XRWlu9XYnoSfboiwcv8M3SlsjAgMBAAE=',",
            "  Addresses: [ '/ip4/0.0.0.0/tcp/0'],",
            "  AgentVersion: 'js-ipfs',",
            "  ProtocolVersion: '9000' }" ]

          expect(stdout[0]).to.equal(expected[0])
          expect(stdout[1]).to.equal(expected[1])
          // expect(stdout[2]).to.equal(expected[2])
          expect(stdout[3]).to.equal(expected[3])
          expect(stdout[4]).to.equal(expected[4])
          expect(stdout[5]).to.equal(expected[5])
          expect(stdout[6]).to.equal(expected[6])
          expect(stdout[7]).to.equal(expected[7])
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          done()
        })
    })
  })

  describe('api running', () => {
    before((done) => {
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
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'id'])
        .run((err, stdout, exitcode) => {
          var expected = [
            "{ ID: 'QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A',",
            "  PublicKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC2SKo/HMFZeBml1AF3XijzrxrfQXdJzjePBZAbdxqKR1Mc6juRHXij6HXYPjlAk01BhF1S3Ll4Lwi0cAHhggf457sMg55UWyeGKeUv0ucgvCpBwlR5cQ020i0MgzjPWOLWq1rtvSbNcAi2ZEVn6+Q2EcHo3wUvWRtLeKz+DZSZfw2PEDC+DGPJPl7f8g7zl56YymmmzH9liZLNrzg/qidokUv5u1pdGrcpLuPNeTODk0cqKB+OUbuKj9GShYECCEjaybJDl9276oalL9ghBtSeEv20kugatTvYy590wFlJkkvyl+nPxIH0EEYMKK9XRWlu9XYnoSfboiwcv8M3SlsjAgMBAAE=',",
            "  Addresses: [ '/ip4/0.0.0.0/tcp/0' ],",
            "  AgentVersion: 'js-ipfs',",
            "  ProtocolVersion: '9000' }" ]

          expect(stdout[0]).to.equal(expected[0])
          expect(stdout[1]).to.equal(expected[1])
          // expect(stdout[2]).to.equal(expected[2])
          expect(stdout[3]).to.equal(expected[3])
          expect(stdout[4]).to.equal(expected[4])
          expect(stdout[5]).to.equal(expected[5])
          expect(stdout[6]).to.equal(expected[6])
          expect(stdout[7]).to.equal(expected[7])
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          done()
        })
    })
  })
})
