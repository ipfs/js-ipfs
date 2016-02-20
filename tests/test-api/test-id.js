/* globals describe, it */

'use strict'

const expect = require('chai').expect

describe('id', () => {
  describe('api', () => {
    var api

    it('api', (done) => {
      api = require('../../src/http-api').server.select('API')
      done()
    })

    it('get the id', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/id'
      }, res => {
        expect(res.result).to.deep.equal({ ID: 'QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A',
          PublicKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC2SKo/HMFZeBml1AF3XijzrxrfQXdJzjePBZAbdxqKR1Mc6juRHXij6HXYPjlAk01BhF1S3Ll4Lwi0cAHhggf457sMg55UWyeGKeUv0ucgvCpBwlR5cQ020i0MgzjPWOLWq1rtvSbNcAi2ZEVn6+Q2EcHo3wUvWRtLeKz+DZSZfw2PEDC+DGPJPl7f8g7zl56YymmmzH9liZLNrzg/qidokUv5u1pdGrcpLuPNeTODk0cqKB+OUbuKj9GShYECCEjaybJDl9276oalL9ghBtSeEv20kugatTvYy590wFlJkkvyl+nPxIH0EEYMKK9XRWlu9XYnoSfboiwcv8M3SlsjAgMBAAE=',
          Addresses: { Swarm: [ '/ip4/0.0.0.0/tcp/4001', '/ip6/::/tcp/4001' ],
            API: '/ip4/127.0.0.1/tcp/5001',
          Gateway: '/ip4/127.0.0.1/tcp/8080' },
          AgentVersion: 'js-ipfs',
          ProtocolVersion: '9000'
        })
        done()
      })
    })
  })

  describe('gateway', () => {})
})
