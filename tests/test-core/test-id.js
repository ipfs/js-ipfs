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
