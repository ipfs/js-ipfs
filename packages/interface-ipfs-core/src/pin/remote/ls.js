/* eslint-env mocha */

import { clearRemotePins, addRemotePins, clearServices } from '../utils.js'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../../utils/mocha.js'
import all from 'it-all'
import { CID } from 'multiformats/cid'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testLs (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  const ENDPOINT = new URL(process.env.PINNING_SERVICE_ENDPOINT || '')
  const KEY = `${process.env.PINNING_SERVICE_KEY}`
  const SERVICE = 'pinbot'

  const cid1 = CID.parse('QmbKtKBrmeRHjNCwR4zAfCJdMVu6dgmwk9M9AE9pUM9RgG')
  const cid2 = CID.parse('QmdFyxZXsFiP4csgfM5uPu99AvFiKH62CSPDw5TP92nr7w')
  const cid3 = CID.parse('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
  const cid4 = CID.parse('QmY9cxiHqTFoWamkQVkpmmqzBrY3hCBEL2XNu3NtX74Fuu')

  describe('.pin.remote.ls', function () {
    this.timeout(50 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    before(async () => {
      ipfs = (await factory.spawn()).api
      await ipfs.pin.remote.service.add(SERVICE, {
        endpoint: ENDPOINT,
        key: KEY
      })
    })
    after(async () => {
      await clearServices(ipfs)
      await factory.clean()
    })

    beforeEach(async () => {
      await clearRemotePins(ipfs)
    })

    it('requires service option', async () => {
      const result = ipfs.pin.remote.ls({})
      await expect(all(result)).to.eventually.be.rejectedWith(/service name must be passed/)
    })

    it('list no pins', async () => {
      const result = ipfs.pin.remote.ls({ service: SERVICE })
      const pins = await all(result)
      expect(pins).to.deep.equal([])
    })

    describe('list pins by status', () => {
      it('list only pinned pins by default', async () => {
        await addRemotePins(ipfs, SERVICE, {
          one: cid1,
          'pinned-two': cid2,
          'pinning-three': cid3,
          'failed-four': cid4
        })

        const list = await all(ipfs.pin.remote.ls({
          service: SERVICE
        }))

        expect(list).to.deep.equal([
          {
            status: 'pinned',
            cid: cid2,
            name: 'pinned-two'
          }
        ])
      })

      it('should list "queued" pins', async () => {
        await addRemotePins(ipfs, SERVICE, {
          one: cid1,
          'pinned-two': cid2,
          'pinning-three': cid3,
          'failed-four': cid4
        })

        const list = await all(ipfs.pin.remote.ls({
          status: ['queued'],
          service: SERVICE
        }))

        expect(list).to.deep.equal([
          {
            status: 'queued',
            cid: cid1,
            name: 'one'
          }
        ])
      })

      it('should list "pinning" pins', async () => {
        await addRemotePins(ipfs, SERVICE, {
          one: cid1,
          'pinned-two': cid2,
          'pinning-three': cid3,
          'failed-four': cid4
        })

        const list = await all(ipfs.pin.remote.ls({
          status: ['pinning'],
          service: SERVICE
        }))

        expect(list).to.deep.equal([
          {
            status: 'pinning',
            cid: cid3,
            name: 'pinning-three'
          }
        ])
      })

      it('should list "failed" pins', async () => {
        await addRemotePins(ipfs, SERVICE, {
          one: cid1,
          'pinned-two': cid2,
          'pinning-three': cid3,
          'failed-four': cid4
        })

        const list = await all(ipfs.pin.remote.ls({
          status: ['failed'],
          service: SERVICE
        }))

        expect(list).to.deep.equal([
          {
            status: 'failed',
            cid: cid4,
            name: 'failed-four'
          }
        ])
      })

      it('should list queued+pinned pins', async () => {
        await addRemotePins(ipfs, SERVICE, {
          one: cid1,
          'pinned-two': cid2,
          'pinning-three': cid3,
          'failed-four': cid4
        })

        const list = await all(ipfs.pin.remote.ls({
          status: ['queued', 'pinned'],
          service: SERVICE
        }))

        expect(list.sort(byCID)).to.deep.equal([
          {
            status: 'queued',
            cid: cid1,
            name: 'one'
          },
          {
            status: 'pinned',
            cid: cid2,
            name: 'pinned-two'
          }
        ].sort(byCID))
      })

      it('should list queued+pinned+pinning pins', async () => {
        await addRemotePins(ipfs, SERVICE, {
          one: cid1,
          'pinned-two': cid2,
          'pinning-three': cid3,
          'failed-four': cid4
        })

        const list = await all(ipfs.pin.remote.ls({
          status: ['queued', 'pinned', 'pinning'],
          service: SERVICE
        }))

        expect(list.sort(byCID)).to.deep.equal([
          {
            status: 'queued',
            cid: cid1,
            name: 'one'
          },
          {
            status: 'pinned',
            cid: cid2,
            name: 'pinned-two'
          },
          {
            status: 'pinning',
            cid: cid3,
            name: 'pinning-three'
          }
        ].sort(byCID))
      })

      it('should list queued+pinned+pinning+failed pins', async () => {
        await addRemotePins(ipfs, SERVICE, {
          one: cid1,
          'pinned-two': cid2,
          'pinning-three': cid3,
          'failed-four': cid4
        })

        const list = await all(ipfs.pin.remote.ls({
          status: ['queued', 'pinned', 'pinning', 'failed'],
          service: SERVICE
        }))

        expect(list.sort(byCID)).to.deep.equal([
          {
            status: 'queued',
            cid: cid1,
            name: 'one'
          },
          {
            status: 'pinned',
            cid: cid2,
            name: 'pinned-two'
          },
          {
            status: 'pinning',
            cid: cid3,
            name: 'pinning-three'
          },
          {
            status: 'failed',
            cid: cid4,
            name: 'failed-four'
          }
        ].sort(byCID))
      })
    })

    describe('list pins by name', () => {
      it('should list no pins when names do not match', async () => {
        await addRemotePins(ipfs, SERVICE, {
          a: cid1,
          b: cid2,
          c: cid3
        })

        const list = await all(ipfs.pin.remote.ls({
          name: 'd',
          status: ['queued', 'pinning', 'pinned', 'failed'],
          service: SERVICE
        }))

        expect(list).to.deep.equal([])
      })
      it('should list only pins with matchin names', async () => {
        await addRemotePins(ipfs, SERVICE, {
          a: cid1,
          b: cid2
        })
        await addRemotePins(ipfs, SERVICE, {
          a: cid3,
          b: cid4
        })

        const list = await all(ipfs.pin.remote.ls({
          name: 'a',
          status: ['queued', 'pinning', 'pinned', 'failed'],
          service: SERVICE
        }))

        expect(list.sort(byCID)).to.deep.equal([
          {
            status: 'queued',
            name: 'a',
            cid: cid1
          },
          {
            status: 'queued',
            name: 'a',
            cid: cid3
          }
        ].sort(byCID))
      })

      it('should list only pins with matchin names & status', async () => {
        await addRemotePins(ipfs, SERVICE, {
          a: cid1,
          b: cid2
        })
        await addRemotePins(ipfs, SERVICE, {
          a: cid3,
          b: cid4
        })
        // update status
        await addRemotePins(ipfs, SERVICE, {
          'pinned-a': cid3
        })

        const list = await all(ipfs.pin.remote.ls({
          name: 'a',
          status: ['pinned'],
          service: SERVICE
        }))

        expect(list).to.deep.equal([
          {
            status: 'pinned',
            name: 'a',
            cid: cid3
          }
        ])
      })
    })

    describe('list pins by cid', () => {
      it('should list pins with matching cid', async () => {
        await addRemotePins(ipfs, SERVICE, {
          a: cid1,
          b: cid2,
          c: cid3,
          d: cid4
        })

        const list = await all(ipfs.pin.remote.ls({
          cid: [cid1],
          status: ['queued', 'pinned', 'pinning', 'failed'],
          service: SERVICE
        }))

        expect(list).to.deep.equal([
          {
            status: 'queued',
            cid: cid1,
            name: 'a'
          }
        ])
      })

      it('should list pins with any matching cid', async () => {
        await addRemotePins(ipfs, SERVICE, {
          a: cid1,
          b: cid2,
          c: cid3,
          d: cid4
        })

        const list = await all(ipfs.pin.remote.ls({
          cid: [cid1, cid3],
          status: ['queued', 'pinned', 'pinning', 'failed'],
          service: SERVICE
        }))

        expect(list.sort(byCID)).to.deep.equal([
          {
            status: 'queued',
            cid: cid1,
            name: 'a'
          },
          {
            status: 'queued',
            cid: cid3,
            name: 'c'
          }
        ].sort(byCID))
      })

      it('should list pins with matching cid+status', async () => {
        await addRemotePins(ipfs, SERVICE, {
          'pinned-a': cid1,
          'failed-b': cid2,
          'pinned-c': cid3,
          d: cid4
        })

        const list = await all(ipfs.pin.remote.ls({
          cid: [cid1, cid2],
          status: ['pinned', 'failed'],
          service: SERVICE
        }))

        expect(list.sort(byCID)).to.deep.equal([
          {
            status: 'pinned',
            cid: cid1,
            name: 'pinned-a'
          },
          {
            status: 'failed',
            cid: cid2,
            name: 'failed-b'
          }
        ].sort(byCID))
      })

      it('should list pins with matching cid+status+name', async () => {
        await addRemotePins(ipfs, SERVICE, {
          'pinned-a': cid1,
          'failed-b': cid2,
          'pinned-c': cid3,
          d: cid4
        })

        const list = await all(ipfs.pin.remote.ls({
          cid: [cid4, cid1, cid2],
          name: 'd',
          status: ['queued', 'pinned'],
          service: SERVICE
        }))

        expect(list).to.deep.equal([
          {
            status: 'queued',
            cid: cid4,
            name: 'd'
          }
        ])
      })
    })
  })
}

/**
 * @param {{ cid: CID }} a
 * @param {{ cid: CID }} b
 */
const byCID = (a, b) => a.cid.toString() > b.cid.toString() ? 1 : -1
