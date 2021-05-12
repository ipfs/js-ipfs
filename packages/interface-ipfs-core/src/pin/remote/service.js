/* eslint-env mocha */
'use strict'

const { clearServices } = require('../utils')
const { getDescribe, getIt, expect } = require('../../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  const ENDPOINT = new URL(process.env.PINNING_SERVICE_ENDPOINT || '')
  const KEY = process.env.PINNING_SERVIEC_KEY

  describe('.pin.remote.service', function () {
    this.timeout(50 * 1000)

    let ipfs
    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(async () => {
      await common.clean()
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
        const result = ipfs.pin.remote.service.add('noend', { key: 'token' })
        await expect(result).to.eventually.be.rejectedWith(/is required/)
      })

      it('service add requires key', async () => {
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
          endpoint: 'http://pinbot.io/',
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
        const result = ipfs.pin.remote.service.rm()
        await expect(result).to.eventually.be.rejectedWith(/is required/)
      })
    })
  })
}

const byName = (a, b) => a.service > b.service ? 1 : -1
