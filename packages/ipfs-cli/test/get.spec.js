/* eslint-env mocha */

import fs from 'fs'
import { expect } from 'aegir/utils/chai.js'
import path from 'path'
import { CID } from 'multiformats/cid'
import { cli } from './utils/cli.js'
import sinon from 'sinon'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { pack } from 'it-tar'
import { pipe } from 'it-pipe'
import map from 'it-map'
import toBuffer from 'it-to-buffer'
import { clean } from './utils/clean.js'
import Pako from 'pako'

const defaultOptions = {
  timeout: undefined,
  archive: undefined,
  compress: undefined,
  compressionLevel: 6
}

/**
 * @param {import('it-tar').TarImportCandidate[]} files
 */
async function * tarballed (files) {
  yield * pipe(
    files,
    pack(),
    /**
     * @param {AsyncIterable<Uint8Array>} source
     */
    (source) => map(source, buf => buf.slice())
  )
}

/**
 * @param {AsyncIterable<Uint8Array>} bytes
 * @param {number} level
 */
async function * gzipped (bytes, level = 6) {
  yield * pipe(
    bytes,
    async function * (source) {
      const buf = await toBuffer(source)

      yield Pako.gzip(buf, {
        level
      })
    }
  )
}

describe('get', () => {
  const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
  const buf = uint8ArrayFromString('hello world')
  let ipfs

  beforeEach(() => {
    ipfs = {
      get: sinon.stub()
    }
  })

  it('should get file', async () => {
    ipfs.get.withArgs(cid.toString(), defaultOptions).returns(
      tarballed([{
        header: {
          name: `${cid}`,
          type: 'file',
          size: buf.length
        },
        body: (async function * () {
          yield buf
        }())
      }])
    )

    const outPath = path.join(process.cwd(), cid.toString())
    await clean(outPath)

    const out = await cli(`get ${cid}`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(fs.readFileSync(outPath)).to.equalBytes(buf)

    await clean(outPath)
  })

  it('get file with output option', async () => {
    ipfs.get.withArgs(cid.toString(), defaultOptions).returns(
      tarballed([{
        header: {
          name: `${cid}`,
          type: 'file',
          size: buf.length
        },
        body: (async function * () {
          yield buf
        }())
      }])
    )

    const outPath = path.join(process.cwd(), 'derp')
    await clean(outPath)

    const out = await cli(`get ${cid} --output ${outPath}`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(fs.readFileSync(path.join(outPath, cid.toString()))).to.equalBytes(buf)

    await clean(outPath)
  })

  it('should get gzipped file', async () => {
    ipfs.get.withArgs(cid.toString(), {
      ...defaultOptions,
      compress: true
    }).returns(
      gzipped(
        async function * () {
          yield buf
        }()
      )
    )

    const outPath = path.join(process.cwd(), cid.toString())
    await clean(outPath)

    const out = await cli(`get ${cid} --compress`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(Pako.inflate(fs.readFileSync(outPath))).to.equalBytes(buf)

    await clean(outPath)
  })

  it('should get gzipped file with short compress option', async () => {
    ipfs.get.withArgs(cid.toString(), {
      ...defaultOptions,
      compress: true
    }).returns(
      gzipped(
        async function * () {
          yield buf
        }()
      )
    )

    const outPath = path.join(process.cwd(), cid.toString())
    await clean(outPath)

    const out = await cli(`get ${cid} -C`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(Pako.inflate(fs.readFileSync(outPath))).to.equalBytes(buf)

    await clean(outPath)
  })

  it('should get gzipped file with compression level', async () => {
    const compressionLevel = 9

    ipfs.get.withArgs(cid.toString(), {
      ...defaultOptions,
      compress: true,
      compressionLevel
    }).returns(
      gzipped(
        (async function * () {
          yield buf
        }()),
        compressionLevel
      )
    )

    const outPath = path.join(process.cwd(), cid.toString())
    await clean(outPath)

    const out = await cli(`get ${cid} --compress --compression-level ${compressionLevel}`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(Pako.inflate(fs.readFileSync(outPath))).to.equalBytes(buf)

    await clean(outPath)
  })

  it('should get gzipped file with short compression level', async () => {
    const compressionLevel = 9

    ipfs.get.withArgs(cid.toString(), {
      ...defaultOptions,
      compress: true,
      compressionLevel
    }).returns(
      gzipped(
        (async function * () {
          yield buf
        }()),
        compressionLevel
      )
    )

    const outPath = path.join(process.cwd(), cid.toString())
    await clean(outPath)

    const out = await cli(`get ${cid} --compress -l ${compressionLevel}`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(Pako.inflate(fs.readFileSync(outPath))).to.equalBytes(buf)

    await clean(outPath)
  })

  it('get gzipped directory', async () => {
    ipfs.get.withArgs(cid.toString(), {
      ...defaultOptions,
      compress: true,
      archive: true
    }).returns(
      gzipped(
        tarballed([{
          header: {
            name: `${cid}`,
            type: 'directory',
            size: 0
          }
        }, {
          header: {
            name: `${cid}/foo.txt`,
            type: 'file',
            size: buf.length
          },
          body: (async function * () {
            yield buf
          }())
        }])
      )
    )

    const outPath = path.join(process.cwd(), cid.toString())
    await clean(outPath)

    const out = await cli(`get ${cid} --archive true --compress true`, { ipfs })
    expect(out).to.eql(
      `Saving file(s) ${cid}\n`
    )

    expect(fs.statSync(outPath).isFile()).to.be.true()
    expect(fs.readFileSync(outPath).slice(0, 2)).to.equalBytes([0x1F, 0x8B]) // gzip magic bytes

    await clean(outPath)
  })

  it('get file with short output option', async () => {
    ipfs.get.withArgs(cid.toString(), defaultOptions).returns(
      tarballed([{
        header: {
          name: `${cid}`,
          type: 'file',
          size: buf.length
        },
        body: (async function * () {
          yield buf
        }())
      }])
    )

    const outPath = path.join(process.cwd(), 'herp')
    await clean(outPath)

    const out = await cli(`get ${cid} -o ${outPath}`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(fs.readFileSync(path.join(outPath, cid.toString()))).to.equalBytes(buf)

    await clean(outPath)
  })

  it('get directory', async () => {
    ipfs.get.withArgs(cid.toString(), defaultOptions).returns(
      tarballed([{
        header: {
          name: `${cid}`,
          type: 'directory',
          size: 0
        }
      }])
    )

    const outPath = path.join(process.cwd(), cid.toString())
    await clean(outPath)

    const out = await cli(`get ${cid}`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(fs.statSync(outPath).isDirectory()).to.be.true()

    await clean(outPath)
  })

  it('get recursively', async () => {
    ipfs.get.withArgs(cid.toString(), defaultOptions).returns(
      tarballed([{
        header: {
          name: `${cid}`,
          type: 'directory',
          size: 0
        }
      }, {
        header: {
          name: `${cid}/foo.txt`,
          type: 'file',
          size: buf.length
        },
        body: (async function * () {
          yield buf
        }())
      }])
    )

    const outPath = path.join(process.cwd(), cid.toString())
    await clean(outPath)

    const out = await cli(`get ${cid}`, { ipfs })
    expect(out).to.eql(
      `Saving file(s) ${cid}\n`
    )

    expect(fs.statSync(outPath).isDirectory()).to.be.true()
    expect(fs.statSync(path.join(outPath, 'foo.txt')).isFile()).to.be.true()
    expect(fs.readFileSync(path.join(outPath, 'foo.txt'))).to.equalBytes(buf)

    await clean(outPath)
  })

  it('should get file with a timeout', async () => {
    ipfs.get.withArgs(cid.toString(), {
      ...defaultOptions,
      timeout: 1000
    }).returns(
      tarballed([{
        header: {
          name: `${cid}`,
          type: 'file',
          size: buf.length
        },
        body: (async function * () {
          yield buf
        }())
      }])
    )

    const outPath = path.join(process.cwd(), cid.toString())
    await clean(outPath)

    const out = await cli(`get ${cid} --timeout=1s`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(fs.readFileSync(outPath)).to.equalBytes(buf)

    await clean(outPath)
  })

  it('should not get file with path traversal characters that result in leaving the output directory', async () => {
    ipfs.get.withArgs(cid.toString(), defaultOptions).returns(
      tarballed([{
        header: {
          name: '../foo.txt',
          type: 'file',
          size: buf.length
        },
        body: (async function * () {
          yield buf
        }())
      }])
    )

    const outPath = path.join(process.cwd(), 'derp')

    await expect(cli(`get ${cid} --output ${outPath}`, { ipfs })).to.eventually.be.rejectedWith(/File prefix invalid/)
  })

  it('should get file with path traversal characters that result in leaving the output directory when forced', async () => {
    ipfs.get.withArgs(cid.toString(), defaultOptions).returns(
      tarballed([{
        header: {
          name: '../foo.txt',
          type: 'file',
          size: buf.length
        },
        body: (async function * () {
          yield buf
        }())
      }])
    )

    const dir = path.join(process.cwd(), 'derp')
    const outPath = path.join(process.cwd(), 'derp', 'herp')
    await clean(dir)

    const out = await cli(`get ${cid} --output ${outPath} --force`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(fs.readFileSync(path.join(dir, 'foo.txt'))).to.equalBytes(buf)

    await clean(dir)
  })

  it('should strip control characters when getting a file', async function () {
    if (process.platform === 'win32') {
      // windows cannot write files with control characters in the path
      return this.skip()
    }

    const ipfsPath = `${cid}/foo/bar`
    const junkPath = `${cid}/foo\b/bar`

    ipfs.get.withArgs(junkPath, defaultOptions).returns(
      tarballed([{
        header: {
          name: junkPath,
          type: 'file',
          size: buf.length
        },
        body: (async function * () {
          yield buf
        }())
      }])
    )

    const outPath = `${process.cwd()}/${junkPath}`
    await clean(outPath)

    const out = await cli(`get ${junkPath}`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${ipfsPath}\n`)

    expect(fs.readFileSync(outPath)).to.equalBytes(buf)

    await clean(outPath)
  })
})
