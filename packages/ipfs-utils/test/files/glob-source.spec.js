'use strict'

/* eslint-env mocha */
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const chaiAsPromised = require('chai-as-promised')
const globSource = require('../../src/files/glob-source')
const all = require('it-all')
const path = require('path')
const {
  isNode
} = require('../../src/env')
const fs = require('fs')

chai.use(dirtyChai)
chai.use(chaiAsPromised)
const expect = chai.expect

function fixture (file) {
  return path.resolve(path.join(__dirname, '..', 'fixtures', file))
}

function findMode (file) {
  return fs.statSync(fixture(file)).mode
}

function findMtime (file) {
  return fs.statSync(fixture(file)).mtime
}

describe('glob-source', () => {
  it('single file, relative path', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource(fixture('file-0.html')))

    expect(result.length).to.equal(1)
    expect(result[0].path).to.equal('/file-0.html')
  })

  it('single file, absolute path', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource(fixture('file-0.html')))

    expect(result.length).to.equal(1)
    expect(result[0].path).to.equal('/file-0.html')
  })

  it('directory, relative path', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource(fixture('/dir'), {
      recursive: true
    }))

    expect(result).to.have.lengthOf(6)
    expect(result).to.have.nested.property('[0].path', '/dir')
    expect(result).to.not.have.nested.property('[0].content')
    expect(result).to.have.nested.property('[1].path', '/dir/file-1.txt')
    expect(result).to.have.nested.property('[2].path', '/dir/file-2.js')
    expect(result).to.have.nested.property('[3].path', '/dir/file-3.css')
    expect(result).to.have.nested.property('[4].path', '/dir/nested-dir')
    expect(result).to.have.nested.property('[5].path', '/dir/nested-dir/other.txt')
  })

  it('directory, hidden files', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource(fixture('/dir'), {
      recursive: true,
      hidden: true
    }))

    expect(result).to.have.lengthOf(7)
    expect(result).to.have.nested.property('[0].path', '/dir')
    expect(result).to.have.nested.property('[1].path', '/dir/.hidden.txt')
    expect(result).to.have.nested.property('[2].path', '/dir/file-1.txt')
    expect(result).to.have.nested.property('[3].path', '/dir/file-2.js')
    expect(result).to.have.nested.property('[4].path', '/dir/file-3.css')
    expect(result).to.have.nested.property('[5].path', '/dir/nested-dir')
    expect(result).to.have.nested.property('[6].path', '/dir/nested-dir/other.txt')
  })

  it('directory, ignore files', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource(fixture('/dir'), {
      recursive: true,
      ignore: ['**/file-1.txt']
    }))

    expect(result).to.have.lengthOf(5)
    expect(result).to.have.nested.property('[0].path', '/dir')
    expect(result).to.have.nested.property('[1].path', '/dir/file-2.js')
    expect(result).to.have.nested.property('[2].path', '/dir/file-3.css')
    expect(result).to.have.nested.property('[3].path', '/dir/nested-dir')
    expect(result).to.have.nested.property('[4].path', '/dir/nested-dir/other.txt')
  })

  it('multiple paths', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource([
      fixture('/dir/file-1.txt'),
      fixture('/dir/file-2.js')
    ]))

    expect(result).to.have.lengthOf(2)
    expect(result).to.have.nested.property('[0].path', '/file-1.txt')
    expect(result).to.have.nested.property('[1].path', '/file-2.js')
  })

  it('requires recursive flag for directory', async function () {
    if (!isNode) {
      return this.skip()
    }

    await expect(all(globSource(fixture('/dir')))).to.be.rejectedWith(/recursive option not set/)
  })

  it('preserves mode for directories', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource(fixture('/dir'), {
      preserveMode: true,
      recursive: true
    }))

    expect(result).to.have.lengthOf(6)
    expect(result).to.have.nested.property('[0].path', '/dir')
    expect(result).to.have.nested.property('[0].mode', findMode('/dir'))
    expect(result).to.have.nested.property('[1].path', '/dir/file-1.txt')
    expect(result).to.have.nested.property('[1].mode', findMode('/dir/file-1.txt'))
    expect(result).to.have.nested.property('[2].path', '/dir/file-2.js')
    expect(result).to.have.nested.property('[2].mode', findMode('/dir/file-2.js'))
    expect(result).to.have.nested.property('[3].path', '/dir/file-3.css')
    expect(result).to.have.nested.property('[3].mode', findMode('/dir/file-3.css'))
    expect(result).to.have.nested.property('[4].path', '/dir/nested-dir')
    expect(result).to.have.nested.property('[4].mode', findMode('/dir/nested-dir'))
    expect(result).to.have.nested.property('[5].path', '/dir/nested-dir/other.txt')
    expect(result).to.have.nested.property('[5].mode', findMode('/dir/nested-dir/other.txt'))
  })

  it('overrides mode for directories', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource(fixture('/dir'), {
      recursive: true,
      mode: 5
    }))

    expect(result).to.have.lengthOf(6)
    expect(result).to.have.nested.property('[0].path', '/dir')
    expect(result).to.have.nested.property('[0].mode', 5)
    expect(result).to.have.nested.property('[1].path', '/dir/file-1.txt')
    expect(result).to.have.nested.property('[1].mode', 5)
    expect(result).to.have.nested.property('[2].path', '/dir/file-2.js')
    expect(result).to.have.nested.property('[2].mode', 5)
    expect(result).to.have.nested.property('[3].path', '/dir/file-3.css')
    expect(result).to.have.nested.property('[3].mode', 5)
    expect(result).to.have.nested.property('[4].path', '/dir/nested-dir')
    expect(result).to.have.nested.property('[4].mode', 5)
    expect(result).to.have.nested.property('[5].path', '/dir/nested-dir/other.txt')
    expect(result).to.have.nested.property('[5].mode', 5)
  })

  it('preserves mtime for directories', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource(fixture('/dir'), {
      preserveMtime: true,
      recursive: true
    }))

    expect(result).to.have.lengthOf(6)
    expect(result).to.have.nested.property('[0].path', '/dir')
    expect(result).to.have.deep.nested.property('[0].mtime', findMtime('/dir'))
    expect(result).to.have.nested.property('[1].path', '/dir/file-1.txt')
    expect(result).to.have.deep.nested.property('[1].mtime', findMtime('/dir/file-1.txt'))
    expect(result).to.have.nested.property('[2].path', '/dir/file-2.js')
    expect(result).to.have.deep.nested.property('[2].mtime', findMtime('/dir/file-2.js'))
    expect(result).to.have.nested.property('[3].path', '/dir/file-3.css')
    expect(result).to.have.deep.nested.property('[3].mtime', findMtime('/dir/file-3.css'))
    expect(result).to.have.nested.property('[4].path', '/dir/nested-dir')
    expect(result).to.have.deep.nested.property('[4].mtime', findMtime('/dir/nested-dir'))
    expect(result).to.have.nested.property('[5].path', '/dir/nested-dir/other.txt')
    expect(result).to.have.deep.nested.property('[5].mtime', findMtime('/dir/nested-dir/other.txt'))
  })

  it('overrides mtime for directories', async function () {
    if (!isNode) {
      return this.skip()
    }

    const result = await all(globSource(fixture('/dir'), {
      recursive: true,
      mtime: new Date(5)
    }))

    expect(result).to.have.lengthOf(6)
    expect(result).to.have.nested.property('[0].path', '/dir')
    expect(result).to.have.deep.nested.property('[0].mtime', new Date(5))
    expect(result).to.have.nested.property('[1].path', '/dir/file-1.txt')
    expect(result).to.have.deep.nested.property('[1].mtime', new Date(5))
    expect(result).to.have.nested.property('[2].path', '/dir/file-2.js')
    expect(result).to.have.deep.nested.property('[2].mtime', new Date(5))
    expect(result).to.have.nested.property('[3].path', '/dir/file-3.css')
    expect(result).to.have.deep.nested.property('[3].mtime', new Date(5))
    expect(result).to.have.nested.property('[4].path', '/dir/nested-dir')
    expect(result).to.have.deep.nested.property('[4].mtime', new Date(5))
    expect(result).to.have.nested.property('[5].path', '/dir/nested-dir/other.txt')
    expect(result).to.have.deep.nested.property('[5].mtime', new Date(5))
  })
})
