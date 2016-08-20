/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (http) => {
  describe('/id', () => {
    let api

    before(() => {
      api = http.api.server.select('API')
    })

    it('get the id', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/id'
      }, (res) => {
        expect(res.result.ID).to.equal(idResult.ID)
        expect(res.result.PublicKey).to.equal(idResult.PublicKey)
        expect(res.result.AgentVersion).to.equal(idResult.AgentVersion)
        expect(res.result.ProtocolVersion).to.equal(idResult.ProtocolVersion)
        done()
      })
    })
  })
}

const idResult = {
  ID: 'QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A',
  PublicKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC2SKo/HMFZeBml1AF3XijzrxrfQXdJzjePBZAbdxqKR1Mc6juRHXij6HXYPjlAk01BhF1S3Ll4Lwi0cAHhggf457sMg55UWyeGKeUv0ucgvCpBwlR5cQ020i0MgzjPWOLWq1rtvSbNcAi2ZEVn6+Q2EcHo3wUvWRtLeKz+DZSZfw2PEDC+DGPJPl7f8g7zl56YymmmzH9liZLNrzg/qidokUv5u1pdGrcpLuPNeTODk0cqKB+OUbuKj9GShYECCEjaybJDl9276oalL9ghBtSeEv20kugatTvYy590wFlJkkvyl+nPxIH0EEYMKK9XRWlu9XYnoSfboiwcv8M3SlsjAgMBAAE=',
  Addresses: [ '/ip4/0.0.0.0/tcp/0' ],
  AgentVersion: 'js-ipfs',
  ProtocolVersion: '9000'
}
