/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const cli = require('../utils/cli')
const sinon = require('sinon')

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

  it('gen', async () => {
    const name = 'key-name'
    const id = 'key-id'

    ipfs.key.gen.withArgs(name, {
      type: 'rsa',
      size: 2048
    }).resolves({
      id,
      name
    })

    const out = await cli(`key gen ${name}`, { ipfs })
    expect(out).to.equal(`generated ${id} ${name}\n`)
  })

  it('gen with args', async () => {
    const name = 'key-name'
    const id = 'key-id'

    ipfs.key.gen.withArgs(name, {
      type: 'rsb',
      size: 7
    }).resolves({
      id,
      name
    })

    const out = await cli(`key gen ${name} --type rsb --size 7`, { ipfs })
    expect(out).to.equal(`generated ${id} ${name}\n`)
  })

  it('gen with short args', async () => {
    const name = 'key-name'
    const id = 'key-id'

    ipfs.key.gen.withArgs(name, {
      type: 'rsc',
      size: 5
    }).resolves({
      id,
      name
    })

    const out = await cli(`key gen ${name} -t rsc -s 5`, { ipfs })
    expect(out).to.equal(`generated ${id} ${name}\n`)
  })

  it('list', async () => {
    const name = 'key-name'
    const id = 'key-id'

    ipfs.key.list.resolves([{
      id,
      name
    }])
    const out = await cli('key list', { ipfs })
    expect(out).to.equal(`${id} ${name}\n`)
  })

  it('rename', async () => {
    const name = 'key-name'
    const newName = 'new-key-name'
    const id = 'key-id'

    ipfs.key.rename.withArgs(name, newName).resolves({
      id,
      now: newName
    })
    const out = await cli(`key rename ${name} ${newName}`, { ipfs })
    expect(out).to.equal(`renamed to ${id} ${newName}\n`)
  })

  it('rm', async () => {
    const name = 'key-name'
    const id = 'key-id'

    ipfs.key.rm.withArgs(name).resolves({
      id,
      name
    })

    const out = await cli(`key rm ${name}`, { ipfs })
    expect(out).to.equal(`${id} ${name}\n`)
  })
})
