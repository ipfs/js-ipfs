'use strict'

/* eslint-env mocha */
const { expect } = require('./utils/chai')
const HTTP = require('../src/http')
const toStream = require('it-to-stream')
const delay = require('delay')
const AbortController = require('abort-controller')
const drain = require('it-drain')
const { isBrowser, isWebWorker } = require('../src/env')

describe('http', function () {
  it('makes a GET request', async function () {
    const res = HTTP.get('http://localhost:3000')

    await expect(res).to.eventually.be.fulfilled()
  })

  it('allow async aborting', async function () {
    const controller = new AbortController()

    const res = HTTP.get('http://localhost:3000', {
      signal: controller.signal
    })
    controller.abort()

    await expect(res).to.eventually.be.rejectedWith(/aborted/)
  })

  it.skip('should handle errors in streaming bodies', async function () {
    if (isBrowser || isWebWorker) {
      // streaming bodies not supported by browsers
      return this.skip()
    }

    const err = new Error('Should be caught')
    const body = (async function * () {
      yield Buffer.from('{}\n')

      await delay(100)

      throw err
    }())

    const res = await HTTP.post('http://localhost:3000', {
      body: toStream.readable(body)
    })

    await expect(drain(HTTP.ndjson(res.body))).to.eventually.be.rejectedWith(/aborted/)
  })

  it.skip('should handle errors in streaming bodies when a signal is passed', async function () {
    if (isBrowser || isWebWorker) {
      // streaming bodies not supported by browsers
      return this.skip()
    }

    const controller = new AbortController()
    const err = new Error('Should be caught')
    const body = (async function * () {
      yield Buffer.from('{}\n')

      await delay(100)

      throw err
    }())

    const res = await HTTP.post('http://localhost:3000', {
      body: toStream.readable(body),
      signal: controller.signal
    })

    await expect(drain(HTTP.ndjson(res.body))).to.eventually.be.rejectedWith(/aborted/)
  })
})
