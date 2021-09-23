/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { factory } from './utils/factory.js'
const f = factory()

describe('.key', function () {
  this.timeout(50 * 1000)

  let ipfs

  before(async () => {
    ipfs = (await f.spawn()).api
  })

  after(() => f.clean())

  describe('.gen', () => {
    it('create a new rsa key', async () => {
      const res = await ipfs.key.gen('foobarsa', { type: 'rsa', size: 2048 })

      expect(res).to.exist()
    })

    it('create a new ed25519 key', async () => {
      const res = await ipfs.key.gen('bazed', { type: 'ed25519' })

      expect(res).to.exist()
    })
  })

  describe('.list', () => {
    it('both keys show up + self', async () => {
      const res = await ipfs.key.list()

      expect(res).to.exist()
      expect(res.length).to.equal(3)
    })
  })
})
