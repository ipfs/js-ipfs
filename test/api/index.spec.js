'use strict'

describe('API', () => {
  it('has the api object', () => {
    expect(apiClients['a']).to.exist
    expect(apiClients['a']).to.have.a.property('id')
  })
})
