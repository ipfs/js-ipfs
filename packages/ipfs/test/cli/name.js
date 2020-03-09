/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const cli = require('../utils/cli')
const sinon = require('sinon')

const defaultResolveArgs = (overrides = {}) => {
  return {
    nocache: false,
    recursive: true,
    ...overrides
  }
}

const defaultPublishArgs = (overrides = {}) => {
  return {
    resolve: true,
    lifetime: '24h',
    key: 'self',
    ttl: '',
    ...overrides
  }
}

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

  it('resolve', async () => {
    const name = 'name'
    const value = 'value'

    ipfs.name.resolve.withArgs(name, defaultResolveArgs()).returns([
      value
    ])

    const out = await cli(`name resolve ${name}`, { ipfs })
    expect(out).to.equal(`${value}\n`)
  })

  it('resolve with no cache', async () => {
    const name = 'name'
    const value = 'value'

    ipfs.name.resolve.withArgs(name, defaultResolveArgs({
      nocache: true
    })).returns([
      value
    ])

    const out = await cli(`name resolve --nocache ${name}`, { ipfs })
    expect(out).to.equal(`${value}\n`)
  })

  it('resolve with no cache (short option)', async () => {
    const name = 'name'
    const value = 'value'

    ipfs.name.resolve.withArgs(name, defaultResolveArgs({
      nocache: true
    })).returns([
      value
    ])

    const out = await cli(`name resolve -n ${name}`, { ipfs })
    expect(out).to.equal(`${value}\n`)
  })

  it('resolve with no recursion', async () => {
    const name = 'name'
    const value = 'value'

    ipfs.name.resolve.withArgs(name, defaultResolveArgs({
      recursive: false
    })).returns([
      value
    ])

    const out = await cli(`name resolve --recursive false ${name}`, { ipfs })
    expect(out).to.equal(`${value}\n`)
  })

  it('resolve with no recursion (short option)', async () => {
    const name = 'name'
    const value = 'value'

    ipfs.name.resolve.withArgs(name, defaultResolveArgs({
      recursive: false
    })).returns([
      value
    ])

    const out = await cli(`name resolve -r false ${name}`, { ipfs })
    expect(out).to.equal(`${value}\n`)
  })

  it('resolve with streaming', async () => {
    const name = 'name'
    const value1 = 'value1'
    const value2 = 'value2'

    ipfs.name.resolve.withArgs(name, defaultResolveArgs()).returns([
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

    ipfs.name.resolve.withArgs(name, defaultResolveArgs()).returns([
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

    ipfs.name.resolve.withArgs(name, defaultResolveArgs()).returns([
      value1,
      value2
    ])

    const out = await cli(`name resolve ${name}`, { ipfs })
    expect(out).to.equal(`${value2}\n`)
  })

  it('publish', async () => {
    const name = 'name'
    const value = 'value'

    ipfs.name.publish.withArgs(name, defaultPublishArgs()).resolves({
      name,
      value
    })

    const out = await cli(`name publish ${name}`, { ipfs })
    expect(out).to.equal(`Published to ${name}: ${value}\n`)
  })

  it('publish with resolve', async () => {
    const name = 'name'
    const value = 'value'

    ipfs.name.publish.withArgs(name, defaultPublishArgs({
      resolve: false
    })).resolves({
      name,
      value
    })

    const out = await cli(`name publish --resolve=false ${name}`, { ipfs })
    expect(out).to.equal(`Published to ${name}: ${value}\n`)
  })

  it('publish with resolve (short option)', async () => {
    const name = 'name'
    const value = 'value'

    ipfs.name.publish.withArgs(name, defaultPublishArgs({
      resolve: false
    })).resolves({
      name,
      value
    })

    const out = await cli(`name publish -r false ${name}`, { ipfs })
    expect(out).to.equal(`Published to ${name}: ${value}\n`)
  })

  it('publish with lifetime', async () => {
    const name = 'name'
    const value = 'value'

    ipfs.name.publish.withArgs(name, defaultPublishArgs({
      lifetime: '1h'
    })).resolves({
      name,
      value
    })

    const out = await cli(`name publish --lifetime=1h ${name}`, { ipfs })
    expect(out).to.equal(`Published to ${name}: ${value}\n`)
  })

  it('publish with lifetime (short option)', async () => {
    const name = 'name'
    const value = 'value'

    ipfs.name.publish.withArgs(name, defaultPublishArgs({
      lifetime: '1h'
    })).resolves({
      name,
      value
    })

    const out = await cli(`name publish -t 1h ${name}`, { ipfs })
    expect(out).to.equal(`Published to ${name}: ${value}\n`)
  })

  it('publish with key', async () => {
    const name = 'name'
    const value = 'value'

    ipfs.name.publish.withArgs(name, defaultPublishArgs({
      key: 'derp'
    })).resolves({
      name,
      value
    })

    const out = await cli(`name publish --key=derp ${name}`, { ipfs })
    expect(out).to.equal(`Published to ${name}: ${value}\n`)
  })

  it('publish with key (short option)', async () => {
    const name = 'name'
    const value = 'value'

    ipfs.name.publish.withArgs(name, defaultPublishArgs({
      key: 'derp'
    })).resolves({
      name,
      value
    })

    const out = await cli(`name publish -k derp ${name}`, { ipfs })
    expect(out).to.equal(`Published to ${name}: ${value}\n`)
  })

  it('publish with ttl', async () => {
    const name = 'name'
    const value = 'value'

    ipfs.name.publish.withArgs(name, defaultPublishArgs({
      ttl: 'derp'
    })).resolves({
      name,
      value
    })

    const out = await cli(`name publish --ttl=derp ${name}`, { ipfs })
    expect(out).to.equal(`Published to ${name}: ${value}\n`)
  })
})
