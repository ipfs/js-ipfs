/* globals describe, it */

'use strict'

const expect = require('chai').expect

process.env.IPFS_PATH = process.cwd() + '/tests/repo-example'
const IPFS = require('../../src/ipfs-core')

describe('id', () => {
  it('get id', done => {
    const ipfs = new IPFS()
    ipfs.id((err, id) => {
      expect(err).to.not.exist
      expect(id).to.deep.equal({ ID: 'QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A',
        PublicKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC2SKo/HMFZeBml1AF3XijzrxrfQXdJzjePBZAbdxqKR1Mc6juRHXij6HXYPjlAk01BhF1S3Ll4Lwi0cAHhggf457sMg55UWyeGKeUv0ucgvCpBwlR5cQ020i0MgzjPWOLWq1rtvSbNcAi2ZEVn6+Q2EcHo3wUvWRtLeKz+DZSZfw2PEDC+DGPJPl7f8g7zl56YymmmzH9liZLNrzg/qidokUv5u1pdGrcpLuPNeTODk0cqKB+OUbuKj9GShYECCEjaybJDl9276oalL9ghBtSeEv20kugatTvYy590wFlJkkvyl+nPxIH0EEYMKK9XRWlu9XYnoSfboiwcv8M3SlsjAgMBAAE=',
        Addresses: {
          Swarm: [ '/ip4/0.0.0.0/tcp/4001', '/ip6/::/tcp/4001' ],
          API: '/ip4/127.0.0.1/tcp/6001',
          Gateway: '/ip4/127.0.0.1/tcp/9090'
        },
        AgentVersion: 'js-ipfs',
        ProtocolVersion: '9000'
      })
      done()
    })
  })
})
