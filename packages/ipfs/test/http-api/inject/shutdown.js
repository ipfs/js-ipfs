/* eslint-env mocha */
'use strict'

const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')

describe('/shutdown', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {}
  })

  it('only accepts POST', () => {
    return testHttpMethod('/api/v0/shutdown')
  })

  it('should shut down', (done) => {
    const listener = () => {
      done()

      process.removeListener('SIGTERM', listener)
    }

    process.on('SIGTERM', listener)

    http({
      method: 'POST',
      url: '/api/v0/shutdown'
    }, { ipfs })
      .then(() => {}, err => done(err))
  })
})
