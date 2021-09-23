/* eslint-env mocha */

import { clearServices } from '../utils.js'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../../utils/mocha.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testService (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  const ENDPOINT = new URL(process.env.PINNING_SERVICE_ENDPOINT || '')
  const KEY = `${process.env.PINNING_SERVICE_KEY}`

  describe('.pin.remote.service', function () {
    this.timeout(50 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(async () => {
      await factory.clean()
    })
    afterEach(() => clearServices(ipfs))

    describe('.pin.remote.service.add', () => {
      it('should add a service', async () => {
        await ipfs.pin.remote.service.add('pinbot', {
          endpoint: ENDPOINT,
          key: KEY
        })

        const services = await ipfs.pin.remote.service.ls()
        expect(services).to.deep.equal([{
          service: 'pinbot',
          endpoint: ENDPOINT
        }])
      })

      it('service add requires endpoint', async () => {
        // @ts-expect-error missing property
        const result = ipfs.pin.remote.service.add('noend', { key: 'token' })
        await expect(result).to.eventually.be.rejectedWith(/is required/)
      })

      it('service add requires key', async () => {
        // @ts-expect-error missing property
        const result = ipfs.pin.remote.service.add('nokey', {
          endpoint: ENDPOINT
        })

        await expect(result).to.eventually.be.rejectedWith(/is required/)
      })

      it('add multiple services', async () => {
        await ipfs.pin.remote.service.add('pinbot', {
          endpoint: ENDPOINT,
          key: KEY
        })

        await ipfs.pin.remote.service.add('pinata', {
          endpoint: new URL('https://api.pinata.cloud'),
          key: 'somekey'
        })

        const services = await ipfs.pin.remote.service.ls()
        expect(services.sort(byName)).to.deep.equal([
          {
            service: 'pinbot',
            endpoint: ENDPOINT
          },
          {
            service: 'pinata',
            endpoint: new URL('https://api.pinata.cloud')
          }
        ].sort(byName))
      })

      it('can not add service with existing name', async () => {
        await ipfs.pin.remote.service.add('pinbot', {
          endpoint: ENDPOINT,
          key: KEY
        })

        const result = ipfs.pin.remote.service.add('pinbot', {
          endpoint: new URL('http://pinbot.io/'),
          key: KEY
        })

        await expect(result).to.eventually.be.rejectedWith(/service already present/)
      })
    })

    describe('.pin.remote.service.ls', () => {
      it('should list services', async () => {
        const services = await ipfs.pin.remote.service.ls()
        expect(services).to.deep.equal([])
      })

      it('should list added service', async () => {
        await ipfs.pin.remote.service.add('pinbot', {
          endpoint: ENDPOINT,
          key: KEY
        })

        const services = await ipfs.pin.remote.service.ls()
        expect(services).to.deep.equal([{
          service: 'pinbot',
          endpoint: ENDPOINT
        }])
      })

      it('should include service stats', async () => {
        await ipfs.pin.remote.service.add('pinbot', {
          endpoint: ENDPOINT,
          key: KEY
        })

        const services = await ipfs.pin.remote.service.ls({ stat: true })

        expect(services).to.deep.equal([{
          service: 'pinbot',
          endpoint: ENDPOINT,
          stat: {
            status: 'valid',
            pinCount: {
              queued: 0,
              pinning: 0,
              pinned: 0,
              failed: 0
            }
          }
        }])
      })

      it('should report unreachable services', async () => {
        await ipfs.pin.remote.service.add('pinbot', {
          endpoint: ENDPOINT,
          key: KEY
        })
        await ipfs.pin.remote.service.add('boombot', {
          // @ts-expect-error invalid property
          endpoint: 'http://127.0.0.1:5555',
          key: 'boom'
        })

        const services = await ipfs.pin.remote.service.ls({ stat: true })

        expect(services.sort(byName)).to.deep.equal([
          {
            service: 'pinbot',
            endpoint: ENDPOINT,
            stat: {
              status: 'valid',
              pinCount: {
                queued: 0,
                pinning: 0,
                pinned: 0,
                failed: 0
              }
            }
          },
          {
            service: 'boombot',
            endpoint: new URL('http://127.0.0.1:5555'),
            stat: {
              status: 'invalid'
            }
          }
        ].sort(byName))
      })
    })

    describe('.pin.remote.service.rm', () => {
      it('should remove service', async () => {
        await ipfs.pin.remote.service.add('pinbot', {
          endpoint: ENDPOINT,
          key: KEY
        })

        const services = await ipfs.pin.remote.service.ls()
        expect(services).to.deep.equal([{
          service: 'pinbot',
          endpoint: ENDPOINT
        }])

        await ipfs.pin.remote.service.rm('pinbot')

        expect(await ipfs.pin.remote.service.ls()).to.deep.equal([])
      })

      it('should not fail if service does not registered', async () => {
        expect(await ipfs.pin.remote.service.ls()).to.deep.equal([])
        expect(await ipfs.pin.remote.service.rm('pinbot')).to.equal(undefined)
      })

      it('expects service name', async () => {
        // @ts-expect-error invalid arg
        const result = ipfs.pin.remote.service.rm()
        await expect(result).to.eventually.be.rejectedWith(/is required/)
      })
    })
  })
}

/**
 * @param {{ service: string }} a
 * @param {{ service: string }} b
 */
const byName = (a, b) => a.service > b.service ? 1 : -1
