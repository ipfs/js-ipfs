'use strict'

/* eslint-env mocha */
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const chaiAsPromised = require('chai-as-promised')
const globSource = require('../../src/files/glob-source')
const all = require('async-iterator-all')
const path = require('path')
const {
  isNode
} = require('../../src/env')

chai.use(dirtyChai)
chai.use(chaiAsPromised)
const expect = chai.expect

describe('glob-source', () => {
  it('single file, relative path', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource(path.relative(process.cwd(), path.join(__dirname, '..', 'fixtures', 'file-0.html'))))

    expect(result.length).to.equal(1)
    expect(result[0].path).to.equal('file-0.html')
  })

  it('directory, relative path', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource(path.relative(process.cwd(), path.join(__dirname, '..', 'fixtures', 'dir')), {
      recursive: true
    }))

    expect(result.length).to.equal(3)
    expect(result[0].path).to.equal('/dir/file-1.txt')
    expect(result[1].path).to.equal('/dir/file-2.js')
    expect(result[2].path).to.equal('/dir/file-3.css')
  })

  it('single file, absolute path', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource(path.resolve(process.cwd(), path.join(__dirname, '..', 'fixtures', 'file-0.html'))))

    expect(result.length).to.equal(1)
    expect(result[0].path).to.equal('file-0.html')
  })

  it('directory, relative path', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource(path.resolve(process.cwd(), path.join(__dirname, '..', 'fixtures', 'dir')), {
      recursive: true
    }))

    expect(result.length).to.equal(3)
    expect(result[0].path).to.equal('/dir/file-1.txt')
    expect(result[1].path).to.equal('/dir/file-2.js')
    expect(result[2].path).to.equal('/dir/file-3.css')
  })

  it('directory, hidden files', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource(path.resolve(process.cwd(), path.join(__dirname, '..', 'fixtures', 'dir')), {
      recursive: true,
      hidden: true
    }))

    expect(result.length).to.equal(4)
    expect(result[0].path).to.equal('/dir/.hidden.txt')
    expect(result[1].path).to.equal('/dir/file-1.txt')
    expect(result[2].path).to.equal('/dir/file-2.js')
    expect(result[3].path).to.equal('/dir/file-3.css')
  })

  it('directory, ignore files', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource(path.resolve(process.cwd(), path.join(__dirname, '..', 'fixtures', 'dir')), {
      recursive: true,
      ignore: ['**/file-1.txt']
    }))

    expect(result.length).to.equal(2)
    expect(result[0].path).to.equal('/dir/file-2.js')
    expect(result[1].path).to.equal('/dir/file-3.css')
  })

  it('multiple paths', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource([
      path.relative(process.cwd(), path.join(__dirname, '..', 'fixtures', 'dir', 'file-1.txt')),
      path.relative(process.cwd(), path.join(__dirname, '..', 'fixtures', 'dir', 'file-2.js'))
    ]))

    expect(result.length).to.equal(2)
    expect(result[0].path).to.equal('file-1.txt')
    expect(result[1].path).to.equal('file-2.js')
  })

  it('requires recursive flag for directory', async function () {
    if (!isNode) {
      return this.skip()
    }

    await expect(all(globSource(path.resolve(process.cwd(), path.join(__dirname, '..', 'fixtures', 'dir'))))).to.be.rejectedWith(/recursive option not set/)
  })
})
