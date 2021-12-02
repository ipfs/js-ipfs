/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

import { expect } from 'aegir/utils/chai.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import first from 'it-first'
import { factory } from './utils/factory.js'
const f = factory()

describe('.log', function () {
  this.timeout(100 * 1000)

  let ipfs

  before(async () => {
    ipfs = (await f.spawn()).api
  })

  after(() => f.clean())

  it('.log.tail', async () => {
    const i = setInterval(async () => {
      try {
        await ipfs.add(uint8ArrayFromString('just adding some data to generate logs'))
      } catch (/** @type {any} */ _) {
        // this can error if the test has finished and we're shutting down the node
      }
    }, 1000)

    const message = await first(ipfs.log.tail())

    clearInterval(i)
    expect(message).to.be.an('object')
  })

  it('.log.ls', async () => {
    const res = await ipfs.log.ls()

    expect(res).to.exist()
    expect(res).to.be.an('array')
  })

  it('.log.level', async () => {
    const res = await ipfs.log.level('all', 'error')

    expect(res).to.exist()
    expect(res).to.be.an('object')
    expect(res).to.not.have.property('error')
    expect(res).to.have.property('message')
  })
})
