/* eslint-env mocha */

import { testHttpMethod } from '../utils/test-http-method.js'
import { http } from '../utils/http.js'

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
