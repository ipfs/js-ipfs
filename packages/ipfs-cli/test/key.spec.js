/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { cli } from './utils/cli.js'
import sinon from 'sinon'

describe('key', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      key: {
        export: sinon.stub(),
        gen: sinon.stub(),
        import: sinon.stub(),
        list: sinon.stub(),
        rename: sinon.stub(),
        rm: sinon.stub()
      }
    }
  })

  describe('gen', () => {
    const name = 'key-name'
    const id = 'key-id'
    const defaultOptions = {
      type: 'ed25519',
      size: 2048,
      timeout: undefined
    }

    it('should generate a key', async () => {
      ipfs.key.gen.withArgs(name, defaultOptions).resolves({
        id,
        name
      })

      const out = await cli(`key gen ${name}`, { ipfs })
      expect(out).to.equal(`generated ${id} ${name}\n`)
    })

    it('gen with args', async () => {
      ipfs.key.gen.withArgs(name, {
        ...defaultOptions,
        type: 'rsa',
        size: 7
      }).resolves({
        id,
        name
      })

      const out = await cli(`key gen ${name} --type rsa --size 7`, { ipfs })
      expect(out).to.equal(`generated ${id} ${name}\n`)
    })

    it('gen with short args', async () => {
      ipfs.key.gen.withArgs(name, {
        ...defaultOptions,
        type: 'rsa',
        size: 5
      }).resolves({
        id,
        name
      })

      const out = await cli(`key gen ${name} -t rsa -s 5`, { ipfs })
      expect(out).to.equal(`generated ${id} ${name}\n`)
    })

    it('gen with a timeout', async () => {
      ipfs.key.gen.withArgs(name, {
        ...defaultOptions,
        timeout: 1000
      }).resolves({
        id,
        name
      })

      const out = await cli(`key gen ${name} --timeout=1s`, { ipfs })
      expect(out).to.equal(`generated ${id} ${name}\n`)
    })

    it('gen strips control characters', async () => {
      const junkName = `${name}\b\b\b`

      ipfs.key.gen.withArgs(junkName, defaultOptions).resolves({
        id,
        name: junkName
      })

      const out = await cli(`key gen ${junkName}`, { ipfs })
      expect(out).to.equal(`generated ${id} ${name}\n`)
    })
  })

  describe('list', () => {
    const name = 'key-name'
    const id = 'key-id'
    const defaultOptions = {
      timeout: undefined
    }

    it('should list keys', async () => {
      ipfs.key.list.withArgs(defaultOptions).resolves([{
        id,
        name
      }])
      const out = await cli('key list', { ipfs })
      expect(out).to.equal(`${id} ${name}\n`)
    })

    it('should list keys with a timeout', async () => {
      ipfs.key.list.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).resolves([{
        id,
        name
      }])
      const out = await cli('key list --timeout=1s', { ipfs })
      expect(out).to.equal(`${id} ${name}\n`)
    })

    it('list strips control characters', async () => {
      const junkName = `${name}\b\b\b`

      ipfs.key.list.withArgs(defaultOptions).resolves([{
        id,
        name: junkName
      }])

      const out = await cli('key list', { ipfs })
      expect(out).to.equal(`${id} ${name}\n`)
    })
  })

  describe('rename', () => {
    const name = 'key-name'
    const newName = 'new-key-name'
    const id = 'key-id'
    const defaultOptions = {
      timeout: undefined
    }

    it('should rename a key', async () => {
      ipfs.key.rename.withArgs(name, newName, defaultOptions).resolves({
        id,
        now: newName
      })
      const out = await cli(`key rename ${name} ${newName}`, { ipfs })
      expect(out).to.equal(`renamed to ${id} ${newName}\n`)
    })

    it('should rename a key with a timeout', async () => {
      ipfs.key.rename.withArgs(name, newName, {
        ...defaultOptions,
        timeout: 1000
      }).resolves({
        id,
        now: newName
      })
      const out = await cli(`key rename ${name} ${newName} --timeout=1s`, { ipfs })
      expect(out).to.equal(`renamed to ${id} ${newName}\n`)
    })

    it('rename strips control characters', async () => {
      const junkName = `${name}\b\b\b`

      ipfs.key.rename.withArgs(name, junkName, defaultOptions).resolves({
        id,
        now: junkName
      })

      const out = await cli(`key rename ${name} ${junkName}`, { ipfs })
      expect(out).to.equal(`renamed to ${id} ${name}\n`)
    })
  })

  describe('rm', () => {
    const name = 'key-name'
    const id = 'key-id'
    const defaultOptions = {
      timeout: undefined
    }

    it('should remove a key', async () => {
      ipfs.key.rm.withArgs(name, defaultOptions).resolves({
        id,
        name
      })

      const out = await cli(`key rm ${name}`, { ipfs })
      expect(out).to.equal(`${id} ${name}\n`)
    })

    it('should remove a key with a timeout', async () => {
      ipfs.key.rm.withArgs(name, {
        ...defaultOptions,
        timeout: 1000
      }).resolves({
        id,
        name
      })

      const out = await cli(`key rm ${name} --timeout=1s`, { ipfs })
      expect(out).to.equal(`${id} ${name}\n`)
    })

    it('remove strips control characters', async () => {
      const junkName = `${name}\b\b\b`

      ipfs.key.rm.withArgs(junkName, defaultOptions).resolves({
        id,
        name: junkName
      })

      const out = await cli(`key rm ${junkName}`, { ipfs })
      expect(out).to.equal(`${id} ${name}\n`)
    })
  })
})
