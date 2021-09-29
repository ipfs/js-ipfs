/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { cli } from './utils/cli.js'
import sinon from 'sinon'

describe('name', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      name: {
        publish: sinon.stub(),
        resolve: sinon.stub()
      }
    }
  })

  describe('resolve', () => {
    const defaultOptions = {
      nocache: false,
      recursive: true,
      timeout: undefined
    }

    it('should resolve a name', async () => {
      const name = 'herp'
      const value = 'derp'

      ipfs.name.resolve.withArgs(name, defaultOptions).returns([
        value
      ])

      const out = await cli(`name resolve ${name}`, { ipfs })
      expect(out).to.equal(`${value}\n`)
    })

    it('resolve with no cache', async () => {
      const name = 'name'
      const value = 'value'

      ipfs.name.resolve.withArgs(name, {
        ...defaultOptions,
        nocache: true
      }).returns([
        value
      ])

      const out = await cli(`name resolve --nocache ${name}`, { ipfs })
      expect(out).to.equal(`${value}\n`)
    })

    it('resolve with no cache (short option)', async () => {
      const name = 'name'
      const value = 'value'

      ipfs.name.resolve.withArgs(name, {
        ...defaultOptions,
        nocache: true
      }).returns([
        value
      ])

      const out = await cli(`name resolve -n ${name}`, { ipfs })
      expect(out).to.equal(`${value}\n`)
    })

    it('resolve with no recursion', async () => {
      const name = 'name'
      const value = 'value'

      ipfs.name.resolve.withArgs(name, {
        ...defaultOptions,
        recursive: false
      }).returns([
        value
      ])

      const out = await cli(`name resolve --recursive false ${name}`, { ipfs })
      expect(out).to.equal(`${value}\n`)
    })

    it('resolve with no recursion (short option)', async () => {
      const name = 'name'
      const value = 'value'

      ipfs.name.resolve.withArgs(name, {
        ...defaultOptions,
        recursive: false
      }).returns([
        value
      ])

      const out = await cli(`name resolve -r false ${name}`, { ipfs })
      expect(out).to.equal(`${value}\n`)
    })

    it('resolve with streaming', async () => {
      const name = 'name'
      const value1 = 'value1'
      const value2 = 'value2'

      ipfs.name.resolve.withArgs(name, defaultOptions).returns([
        value1,
        value2
      ])

      const out = await cli(`name resolve --stream ${name}`, { ipfs })
      expect(out).to.equal(`${value1}\n${value2}\n`)
    })

    it('resolve with streaming (short option)', async () => {
      const name = 'name'
      const value1 = 'value1'
      const value2 = 'value2'

      ipfs.name.resolve.withArgs(name, defaultOptions).returns([
        value1,
        value2
      ])

      const out = await cli(`name resolve -s ${name}`, { ipfs })
      expect(out).to.equal(`${value1}\n${value2}\n`)
    })

    it('resolve multiple results without streaming only prints the last result', async () => {
      const name = 'name'
      const value1 = 'value1'
      const value2 = 'value2'

      ipfs.name.resolve.withArgs(name, defaultOptions).returns([
        value1,
        value2
      ])

      const out = await cli(`name resolve ${name}`, { ipfs })
      expect(out).to.equal(`${value2}\n`)
    })

    it('should resolve a name with a timeout', async () => {
      const name = 'name'
      const value = 'value'

      ipfs.name.resolve.withArgs(name, {
        ...defaultOptions,
        timeout: 1000
      }).returns([
        value
      ])

      const out = await cli(`name resolve ${name} --timeout=1s`, { ipfs })
      expect(out).to.equal(`${value}\n`)
    })
  })

  describe('publish', () => {
    const name = 'name'
    const value = 'value'
    const defaultOptions = {
      resolve: true,
      lifetime: '24h',
      key: 'self',
      ttl: '',
      timeout: undefined
    }

    it('should publish a name', async () => {
      ipfs.name.publish.withArgs(name, defaultOptions).resolves({
        name,
        value
      })

      const out = await cli(`name publish ${name}`, { ipfs })
      expect(out).to.equal(`Published to ${name}: ${value}\n`)
    })

    it('publish with resolve', async () => {
      ipfs.name.publish.withArgs(name, {
        ...defaultOptions,
        resolve: false
      }).resolves({
        name,
        value
      })

      const out = await cli(`name publish --resolve=false ${name}`, { ipfs })
      expect(out).to.equal(`Published to ${name}: ${value}\n`)
    })

    it('publish with resolve (short option)', async () => {
      ipfs.name.publish.withArgs(name, {
        ...defaultOptions,
        resolve: false
      }).resolves({
        name,
        value
      })

      const out = await cli(`name publish -r false ${name}`, { ipfs })
      expect(out).to.equal(`Published to ${name}: ${value}\n`)
    })

    it('publish with lifetime', async () => {
      ipfs.name.publish.withArgs(name, {
        ...defaultOptions,
        lifetime: '1h'
      }).resolves({
        name,
        value
      })

      const out = await cli(`name publish --lifetime=1h ${name}`, { ipfs })
      expect(out).to.equal(`Published to ${name}: ${value}\n`)
    })

    it('publish with lifetime (short option)', async () => {
      ipfs.name.publish.withArgs(name, {
        ...defaultOptions,
        lifetime: '1h'
      }).resolves({
        name,
        value
      })

      const out = await cli(`name publish -t 1h ${name}`, { ipfs })
      expect(out).to.equal(`Published to ${name}: ${value}\n`)
    })

    it('publish with key', async () => {
      ipfs.name.publish.withArgs(name, {
        ...defaultOptions,
        key: 'derp'
      }).resolves({
        name,
        value
      })

      const out = await cli(`name publish --key=derp ${name}`, { ipfs })
      expect(out).to.equal(`Published to ${name}: ${value}\n`)
    })

    it('publish with key (short option)', async () => {
      ipfs.name.publish.withArgs(name, {
        ...defaultOptions,
        key: 'derp'
      }).resolves({
        name,
        value
      })

      const out = await cli(`name publish -k derp ${name}`, { ipfs })
      expect(out).to.equal(`Published to ${name}: ${value}\n`)
    })

    it('publish with ttl', async () => {
      ipfs.name.publish.withArgs(name, {
        ...defaultOptions,
        ttl: 'derp'
      }).resolves({
        name,
        value
      })

      const out = await cli(`name publish --ttl=derp ${name}`, { ipfs })
      expect(out).to.equal(`Published to ${name}: ${value}\n`)
    })

    it('should publish a name with a timeout', async () => {
      ipfs.name.publish.withArgs(name, {
        ...defaultOptions,
        timeout: 1000
      }).resolves({
        name,
        value
      })

      const out = await cli(`name publish ${name} --timeout=1s`, { ipfs })
      expect(out).to.equal(`Published to ${name}: ${value}\n`)
    })

    it('should strip control characters when publishing names', async () => {
      const name = 'name'
      const junkName = `${name}\b`
      const value = 'data'

      ipfs.name.publish.withArgs(junkName, defaultOptions)
        .resolves({
          name: junkName,
          value
        })

      const out = await cli(`name publish ${junkName}`, { ipfs })
      expect(out).to.equal(`Published to ${name}: ${value}\n`)
    })
  })
})
