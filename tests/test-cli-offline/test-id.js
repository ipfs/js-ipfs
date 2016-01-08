/* globals describe, it */

'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')

describe('id', () => {
  it('get the id', done => {
    nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'id'])
     .run((err, stdout, exitcode) => {
       var expected = [ '{ ID: \'QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A\',',
                        '  PublicKey: \'\',',
                        '  Addresses: ',
                        '   { Swarm: [ \'/ip4/0.0.0.0/tcp/4001\', \'/ip6/::/tcp/4001\' ],',
                        '     API: \'/ip4/127.0.0.1/tcp/5001\',',
                        '     Gateway: \'/ip4/127.0.0.1/tcp/8080\' },',
                        '  AgentVersion: \'js-ipfs\',',
                        '  ProtocolVersion: \'9000\' }' ]

       expect(stdout[0]).to.equal(expected[0])
       expect(stdout[1]).to.equal(expected[1])
       expect(stdout[2]).to.equal(expected[2])
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
