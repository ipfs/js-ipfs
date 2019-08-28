/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const { HTTPError } = require('ky-universal')
const expect = chai.expect
chai.use(dirtyChai)
const throwsAsync = require('./utils/throws-async')
const errorHandler = require('../src/lib/error-handler')

describe('lib/error-handler', () => {
  it('should parse json error response', async () => {
    const res = {
      ok: false,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({
        Message: 'boom',
        Code: 0,
        Type: 'error'
      }),
      status: 500
    }

    const err = await throwsAsync(errorHandler(res))

    expect(err.message).to.eql('boom')
    expect(err.status).to.eql(500)
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
