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
        const agentComponents = res.result.AgentVersion.split('/')
        expect(agentComponents).lengthOf.above(1)
        expect(agentComponents[0]).to.equal(idResult.AgentVersion)
        expect(res.result.ProtocolVersion).to.equal(idResult.ProtocolVersion)
        done()
      })
    })
  })
}

const idResult = {
  ID: 'QmTuh8pVDCz5kbShrK8MJsJgTycCcGwZm8hQd8SxdbYmby',
  PublicKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCiyLgGRpuGiorm6FzvBbrTU60e6iPMmwXL9mXyGitepQyeN7XF8e6cooFeJI/NIyvbmpa7rHCDzTWP+6ebIMOXjUjQDAgaYdHywKbAXi2cgh96yuTN+cfPJ0IVA1/4Xsn/mnaMmSNDxqnK3fExEDxZizL9iI7KQCGOHociwjNj2cqaz+4ldTQ6QBbqa8nBMbulUNtSzwihQHTHNVwhuYFGPXIIK8UhM1VR20HcCbX+TZ9RpBWLIGZgjJl2ClW7wLW1OAb55I/9CK6AmfOriVYSBxZSFi2jiPCGQmuzfiqEke6/hSZtxe8DRo8ELOQ9K2P3L27H2az2atis2FoqVY2LAgMBAAE=',
  Addresses: [ '/ip4/0.0.0.0/tcp/0' ],
  AgentVersion: 'js-ipfs',
  ProtocolVersion: '9000'
}
