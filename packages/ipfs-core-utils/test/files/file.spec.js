'use strict'

/* eslint-env mocha */
const { readBlob } = require('../../src/files/blob')
const all = require('it-all')
const { expect } = require('../utils/chai')
const TextEncoder = require('ipfs-utils/src/text-encoder')
const { File } = require('../../src/files/file')
const { Promise, setTimeout } = require('ipfs-utils/src/globalthis')

describe('File', function () {
  it('new File', async () => {
    expect(() => new File()).to.throw(TypeError)
    expect(() => new File([])).to.throw(TypeError)

    const before = Date.now()
    await new Promise(resolve => setTimeout(resolve, 3))
    const file = new File(['test'], 'name')
    await new Promise(resolve => setTimeout(resolve, 3))
    const after = Date.now()
    expect(file.size).to.be.equal(4)
    expect(file.name).to.be.equal('name')
    expect(file.lastModified).to.be.a('number')
    expect(file.lastModified).to.be.greaterThan(before)
    expect(file.lastModified).to.be.lessThan(after)
    expect(file.type).to.be.equal('')
    expect(await all(readBlob(file))).to.be.deep.equal([new TextEncoder().encode('test')])
  })

  it('File with lastModified', () => {
    const file = new File(['test'], 'name', { lastModified: 1594672000418 })

    expect(file.size).to.be.equal(4)
    expect(file.name).to.be.equal('name')
    expect(file.lastModified).to.be.equal(1594672000418)
    expect(file.type).to.be.equal('')
  })

  it('File with type', () => {
    const file = new File(['test'], 'name', {
      lastModified: 1594672000418,
      type: 'text/plain'
    })

    expect(file.size).to.be.equal(4)
    expect(file.name).to.be.equal('name')
    expect(file.lastModified).to.be.equal(1594672000418)
    expect(file.type).to.be.equal('text/plain')
  })

  it('File type is normalized', () => {
    const file = new File(['test'], 'name', {
      type: 'Text/Plain'
    })

    expect(file.size).to.be.equal(4)
    expect(file.name).to.be.equal('name')
    expect(file.type).to.be.equal('text/plain')
  })

  it('File name is escaped', () => {
    const file = new File(['test'], 'dir/name')

    expect(file.size).to.be.equal(4)
    expect(file.name).to.be.equal('dir:name')
    expect(file.type).to.be.equal('')
  })
})
