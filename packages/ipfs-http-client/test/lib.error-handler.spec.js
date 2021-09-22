/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { throwsAsync } from './utils/throws-async.js'
import { errorHandler, HTTPError } from '../src/lib/core.js'

describe('lib/error-handler', () => {
  it('should parse json error response', async () => {
    const res = {
      ok: false,
      statusText: 'test',
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({
        Message: 'boom',
        Code: 0,
        Type: 'error'
      }),
      status: 500
    }

    const err = await throwsAsync(errorHandler(res))

    expect(err instanceof HTTPError).to.be.true()
    expect(err.message).to.eql('boom')
    expect(err.response.status).to.eql(500)
  })

  it('should gracefully fail on parse json', async () => {
    const res = {
      ok: false,
      headers: { get: () => 'application/json' },
      json: () => 'boom', // not valid json!
      status: 500
    }

    const err = await throwsAsync(errorHandler(res))
    expect(err instanceof HTTPError).to.be.true()
  })

  it('should gracefully fail on read text', async () => {
    const res = {
      ok: false,
      headers: { get: () => 'text/plain' },
      text: () => Promise.reject(new Error('boom')),
      status: 500
    }

    const err = await throwsAsync(errorHandler(res))
    expect(err instanceof HTTPError).to.be.true()
  })
})
