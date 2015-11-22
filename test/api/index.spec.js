'use strict'

describe('API', () => {
  it('has the api object', () => {
    assert(apiClients['a'])
    assert(apiClients['a'].id)
  })
})
