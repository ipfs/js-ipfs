/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const cli = require('../../src/cli/parser')

describe('id', () => {
  it('should output formatted json string', (done) => {
    const fakeId = sinon.fake.returns(
      { id: 'id', publicKey: 'publicKey' }
    )
    cli
      .onFinishCommand((data) => {
        expect(data).to.be.eq('{\n  "id": "id",\n  "publicKey": "publicKey"\n}')
        sinon.assert.calledOnce(fakeId)
        done()
      })
      .fail((msg, err) => done(err))
      .parse('id', { ipfs: { api: { id: fakeId } } })
  })
})
