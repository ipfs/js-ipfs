/* eslint-env mocha */

const expect = require('chai').expect

process.env.IPFS_PATH = process.cwd() + '/tests/repo-example'
const IPFS = require('../../src/core')

describe('id', () => {
  var ipfs

  before((done) => {
    ipfs = new IPFS()
    ipfs.load(done)
  })

  it('get id', (done) => {
    ipfs.id((err, id) => {
      expect(err).to.not.exist
      expect(id).to.deep.equal({ ID: 'QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A',
        PublicKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC2SKo/HMFZeBml1AF3XijzrxrfQXdJzjePBZAbdxqKR1Mc6juRHXij6HXYPjlAk01BhF1S3Ll4Lwi0cAHhggf457sMg55UWyeGKeUv0ucgvCpBwlR5cQ020i0MgzjPWOLWq1rtvSbNcAi2ZEVn6+Q2EcHo3wUvWRtLeKz+DZSZfw2PEDC+DGPJPl7f8g7zl56YymmmzH9liZLNrzg/qidokUv5u1pdGrcpLuPNeTODk0cqKB+OUbuKj9GShYECCEjaybJDl9276oalL9ghBtSeEv20kugatTvYy590wFlJkkvyl+nPxIH0EEYMKK9XRWlu9XYnoSfboiwcv8M3SlsjAgMBAAE=',
        Addresses: [ '/ip4/0.0.0.0/tcp/0' ],
        AgentVersion: 'js-ipfs',
        ProtocolVersion: '9000'
      })
      done()
    })
  })
})
