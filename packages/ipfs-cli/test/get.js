/* eslint-env mocha */
'use strict'

const fs = require('fs')
const { expect } = require('aegir/utils/chai')
const path = require('path')
const clean = require('./utils/clean')
const CID = require('cids')
const cli = require('./utils/cli')
const sinon = require('sinon')
const uint8ArrayFromString = require('uint8arrays/from-string')

const defaultOptions = {
  timeout: undefined
}

describe('get', () => {
  const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
  const buf = uint8ArrayFromString('hello world')
  let ipfs

  beforeEach(() => {
    ipfs = {
      get: sinon.stub()
    }
  })

  it('should get file', async () => {
    ipfs.get.withArgs(cid.toString(), defaultOptions).returns([{
      type: 'file',
      path: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB',
      content: function * () {
        yield buf
      }
    }])

    const outPath = path.join(process.cwd(), cid.toString())
    await clean(outPath)

    const out = await cli(`get ${cid}`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(fs.readFileSync(outPath)).to.deep.equal(buf)

    await clean(outPath)
  })

  it('get file with output option', async () => {
    ipfs.get.withArgs(cid.toString(), defaultOptions).returns([{
      type: 'file',
      path: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB',
      content: function * () {
        yield buf
      }
    }])

    const outPath = path.join(process.cwd(), 'derp')
    await clean(outPath)

    const out = await cli(`get ${cid} --output ${outPath}`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(fs.readFileSync(path.join(outPath, cid.toString()))).to.deep.equal(buf)

    await clean(outPath)
  })

  it('get file with short output option', async () => {
    ipfs.get.withArgs(cid.toString(), defaultOptions).returns([{
      type: 'file',
      path: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB',
      content: function * () {
        yield buf
      }
    }])

    const outPath = path.join(process.cwd(), 'herp')
    await clean(outPath)

    const out = await cli(`get ${cid} -o ${outPath}`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(fs.readFileSync(path.join(outPath, cid.toString()))).to.deep.equal(buf)

    await clean(outPath)
  })

  it('get directory', async () => {
    ipfs.get.withArgs(cid.toString(), defaultOptions).returns([{
      type: 'dir',
      path: cid.toString()
    }])

    const outPath = path.join(process.cwd(), cid.toString())
    await clean(outPath)

    const out = await cli(`get ${cid}`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(fs.statSync(outPath).isDirectory()).to.be.true()

    await clean(outPath)
  })

  it('get recursively', async () => {
    ipfs.get.withArgs(cid.toString(), defaultOptions).returns([{
      type: 'dir',
      path: cid.toString()
    }, {
      type: 'file',
      path: `${cid}/foo.txt`,
      content: function * () {
        yield buf
      }
    }])

    const outPath = path.join(process.cwd(), cid.toString())
    await clean(outPath)

    const out = await cli(`get ${cid}`, { ipfs })
    expect(out).to.eql(
      `Saving file(s) ${cid}\n`
    )

    expect(fs.statSync(outPath).isDirectory()).to.be.true()
    expect(fs.statSync(path.join(outPath, 'foo.txt')).isFile()).to.be.true()
    expect(fs.readFileSync(path.join(outPath, 'foo.txt'))).to.deep.equal(buf)

    await clean(outPath)
  })

  it('should get file with a timeout', async () => {
    ipfs.get.withArgs(cid.toString(), {
      ...defaultOptions,
      timeout: 1000
    }).returns([{
      type: 'file',
      path: cid.toString(),
      content: function * () {
        yield buf
      }
    }])

    const outPath = path.join(process.cwd(), cid.toString())
    await clean(outPath)

    const out = await cli(`get ${cid} --timeout=1s`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(fs.readFileSync(outPath)).to.deep.equal(buf)

    await clean(outPath)
  })

  it('should not get file with path traversal characters that result in leaving the output directory', async () => {
    ipfs.get.withArgs(cid.toString(), defaultOptions).returns([{
      type: 'file',
      path: '../foo.txt',
      content: function * () {
        yield buf
      }
    }])

    const outPath = path.join(process.cwd(), 'derp')

    await expect(cli(`get ${cid} --output ${outPath}`, { ipfs })).to.eventually.be.rejectedWith(/File prefix invalid/)
  })

  it('should get file with path traversal characters that result in leaving the output directory when forced', async () => {
    ipfs.get.withArgs(cid.toString(), defaultOptions).returns([{
      type: 'file',
      path: '../foo.txt',
      content: function * () {
        yield buf
      }
    }])

    const dir = path.join(process.cwd(), 'derp')
    const outPath = path.join(process.cwd(), 'derp', 'herp')
    await clean(dir)

    const out = await cli(`get ${cid} --output ${outPath} --force`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(fs.readFileSync(path.join(dir, 'foo.txt'))).to.deep.equal(buf)

    await clean(dir)
  })

  it('should strip control characters when getting a file', async function () {
    if (process.platform === 'win32') {
      // windows cannot write files with control characters in the path
      return this.skip()
    }

    const ipfsPath = `${cid}/foo/bar`
    const junkPath = `${cid}/foo\b/bar`

    ipfs.get.withArgs(junkPath, defaultOptions).returns([{
      type: 'file',
      path: junkPath,
      content: function * () {
        yield buf
      }
    }])

    const outPath = `${process.cwd()}/${junkPath}`
    await clean(outPath)

    const out = await cli(`get ${junkPath}`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${ipfsPath}\n`)

    expect(fs.readFileSync(outPath)).to.deep.equal(buf)

    await clean(outPath)
  })
})
