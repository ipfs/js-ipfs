/* globals describe, it */

'use strict'

const expect = require('chai').expect
const api = require('../../src/http-api')

describe('id', function () {
  it('get the id', done => {
    api.server.inject({
      method: 'GET',
      url: '/api/v0/id'
    }, res => {
      expect(res.result).to.deep.equal({ ID: 'QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A',
        PublicKey: '',
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
