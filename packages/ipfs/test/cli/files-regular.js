/* eslint-env mocha */
'use strict'

const fs = require('fs')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const path = require('path')
const rimraf = require('rimraf').sync
const CID = require('cids')
const first = require('it-first')
const cli = require('../utils/cli')
const sinon = require('sinon')
const { Buffer } = require('buffer')

// TODO: Test against all algorithms Object.keys(mh.names)
// This subset is known to work with both go-ipfs and js-ipfs as of 2017-09-05
const HASH_ALGS = [
  'sha1',
  'sha2-256',
  'sha2-512',
  'keccak-224',
  'keccak-256',
  'keccak-384',
  'keccak-512'
]

function defaultAddArgs (overrides) {
  return {
    trickle: false,
    shardSplitThreshold: 1000,
    cidVersion: 0,
    rawLeaves: false,
    onlyHash: false,
    hashAlg: 'sha2-256',
    wrapWithDirectory: false,
    pin: true,
    chunker: 'size-262144',
    preload: true,
    fileImportConcurrency: 50,
    blockWriteConcurrency: 10,
    progress: sinon.match.func,
    ...overrides
  }
}

function defaultCatArgs (overrides) {
  return {
    offset: undefined,
    length: undefined,
    ...overrides
  }
}

function matchIterable () {
  return sinon.match((thing) => Boolean(thing[Symbol.asyncIterator]) || Boolean(thing[Symbol.iterator]))
}

describe('files', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      add: sinon.stub(),
      cat: sinon.stub(),
      get: sinon.stub()
    }
  })

  it('add', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.add.withArgs(matchIterable(), defaultAddArgs()).returns([{
      cid: new CID(cid),
      path: 'readme'
    }])

    const out = await cli('add --progress false src/init-files/init-docs/readme', { ipfs })
    expect(out)
      .to.equal(`added ${cid} readme\n`)
  })

  it('adds a file path with progress', async () => {
    const cid = 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'

    ipfs.add.withArgs(matchIterable(), defaultAddArgs()).returns([{
      cid: new CID(cid),
      path: 'readme'
    }])

    const out = await cli('add src/init-files/init-docs/readme', { ipfs })
    expect(out).to.equal(`added ${cid} readme\n`)
  })

  it('add multiple', async () => {
    const cid1 = 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'
    const cid2 = 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'

    ipfs.add.withArgs(matchIterable(), defaultAddArgs({
      progress: sinon.match.func,
      wrapWithDirectory: true
    })).returns([{
      cid: new CID(cid1),
      path: 'readme'
    }, {
      cid: new CID(cid2),
      path: 'hello'
    }])

    const out = await cli('add src/init-files/init-docs/readme "test/fixtures/odd-name-[v0]/odd name [v1]/hello" --wrap-with-directory', { ipfs })
    expect(out).to.include(`added ${cid1} readme\n`)
    expect(out).to.include(`added ${cid2} hello\n`)
  })

  it('add with cid-version=1', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB').toV1()

    ipfs.add.withArgs(matchIterable(), defaultAddArgs({
      cidVersion: 1
    })).returns([{
      cid,
      path: 'readme'
    }])

    const out = await cli('add src/init-files/init-docs/readme --cid-version=1', { ipfs })
    expect(out).to.equal(`added ${cid} readme\n`)
  })

  it('add with cid-version=1 and raw-leaves=false', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB').toV1()

    ipfs.add.withArgs(matchIterable(), defaultAddArgs({
      cidVersion: 1,
      rawLeaves: false
    })).returns([{
      cid,
      path: 'readme'
    }])

    const out = await cli('add src/init-files/init-docs/readme --cid-version=1 --raw-leaves=false', { ipfs })
    expect(out).to.equal(`added ${cid} readme\n`)
  })

  it('add with cid-version=1 and raw-leaves=true', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB').toV1()

    ipfs.add.withArgs(matchIterable(), defaultAddArgs({
      cidVersion: 1,
      rawLeaves: true
    })).returns([{
      cid,
      path: 'readme'
    }])

    const out = await cli('add src/init-files/init-docs/readme --cid-version=1 --raw-leaves=true', { ipfs })
    expect(out).to.equal(`added ${cid} readme\n`)
  })

  it('add from pipe', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.add.withArgs(sinon.match({
      content: matchIterable()
    }), defaultAddArgs()).returns([{
      cid,
      path: 'readme'
    }])

    const proc = cli('add', {
      ipfs,
      getStdin: function * () {
        yield Buffer.from('hello\n')
      }
    })

    const out = await proc
    expect(out).to.equal(`added ${cid} ${cid}\n`)
  })

  it('add from pipe with mtime=100', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.add.withArgs(sinon.match({
      content: matchIterable(),
      mtime: { secs: 100 }
    }), defaultAddArgs()).returns([{
      cid,
      path: 'readme'
    }])

    const proc = cli('add --mtime=100', {
      ipfs,
      getStdin: function * () {
        yield Buffer.from('hello\n')
      }
    })

    const out = await proc
    expect(out).to.equal(`added ${cid} ${cid}\n`)
  })

  it('add --quiet', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.add.withArgs(matchIterable(), defaultAddArgs()).returns([{
      cid,
      path: 'readme'
    }])

    const out = await cli('add --quiet src/init-files/init-docs/readme', { ipfs })
    expect(out).to.equal(`${cid}\n`)
  })

  it('add --quiet (short option)', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.add.withArgs(matchIterable(), defaultAddArgs()).returns([{
      cid,
      path: 'readme'
    }])

    const out = await cli('add -q src/init-files/init-docs/readme', { ipfs })
    expect(out).to.equal(`${cid}\n`)
  })

  it('add --quieter', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.add.withArgs(matchIterable(), defaultAddArgs()).returns([{
      cid,
      path: 'readme'
    }])

    const out = await cli('add --quieter src/init-files/init-docs/readme', { ipfs })
    expect(out).to.equal(`${cid}\n`)
  })

  it('add --quieter (short option)', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.add.withArgs(matchIterable(), defaultAddArgs()).returns([{
      cid,
      path: 'readme'
    }])

    const out = await cli('add -Q src/init-files/init-docs/readme', { ipfs })
    expect(out).to.equal(`${cid}\n`)
  })

  it('add --silent', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.add.withArgs(matchIterable(), defaultAddArgs()).returns([{
      cid,
      path: 'readme'
    }])

    const out = await cli('add --silent src/init-files/init-docs/readme', { ipfs })
    expect(out).to.equal('')
  })

  it('add --only-hash outputs correct hash', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.add.withArgs(matchIterable(), defaultAddArgs({
      onlyHash: true
    })).returns([{
      cid,
      path: 'readme'
    }])

    const out = await cli('add --only-hash src/init-files/init-docs/readme', { ipfs })
    expect(out).to.equal(`added ${cid} readme\n`)
  })

  it('add does not pin with --pin=false', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.add.withArgs(matchIterable(), defaultAddArgs({
      pin: false
    })).returns([{
      cid,
      path: 'readme'
    }])

    const out = await cli('add --pin false src/init-files/init-docs/readme', { ipfs })
    expect(out).to.equal(`added ${cid} readme\n`)
  })

  it('add with mtime', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.add.withArgs(matchIterable(), defaultAddArgs()).returns([{
      cid,
      path: 'readme'
    }])

    const out = await cli('add --mtime 5 src/init-files/init-docs/readme', { ipfs })
    expect(out).to.equal(`added ${cid} readme\n`)

    const source = ipfs.add.getCall(0).args[0]
    const input = await first(source)
    expect(input).to.have.nested.property('mtime.secs', 5)
  })

  it('add with mtime-nsecs', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.add.withArgs(matchIterable(), defaultAddArgs()).returns([{
      cid,
      path: 'readme'
    }])

    const out = await cli('add --mtime 5 --mtime-nsecs 100 src/init-files/init-docs/readme', { ipfs })
    expect(out).to.equal(`added ${cid} readme\n`)

    const source = ipfs.add.getCall(0).args[0]
    const input = await first(source)
    expect(input).to.have.nested.property('mtime.secs', 5)
    expect(input).to.have.nested.property('mtime.nsecs', 100)
  })

  it('add with mode', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.add.withArgs(matchIterable(), defaultAddArgs()).returns([{
      cid,
      path: 'readme'
    }])

    const out = await cli('add --mode 0655 src/init-files/init-docs/readme', { ipfs })
    expect(out).to.equal(`added ${cid} readme\n`)

    const source = ipfs.add.getCall(0).args[0]
    const input = await first(source)
    expect(input).to.have.property('mode', '0655')
  })

  HASH_ALGS.forEach((name) => {
    it(`add with hash=${name} and raw-leaves=false`, async () => {
      const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

      ipfs.add.withArgs(matchIterable(), defaultAddArgs({
        hashAlg: name,
        rawLeaves: false
      })).returns([{
        cid,
        path: 'readme'
      }])

      const out = await cli(`add src/init-files/init-docs/readme --hash=${name} --raw-leaves=false`, { ipfs })
      expect(out).to.equal(`added ${cid} readme\n`)
    })
  })

  it('should add and print CID encoded in specified base', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.add.withArgs(matchIterable(), defaultAddArgs()).returns([{
      cid,
      path: 'readme'
    }])

    const out = await cli('add  --cid-base=base64 src/init-files/init-docs/readme', { ipfs })
    expect(out).to.equal(`added ${cid.toV1().toString('base64')} readme\n`)
  })

  it('cat', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
    const buf = Buffer.from('hello world')

    ipfs.cat.withArgs(cid.toString(), defaultCatArgs()).returns([buf])

    const out = await cli(`cat ${cid}`, { ipfs })
    expect(out).to.equal(buf.toString('utf8'))
  })

  it('cat part of a file using `count`', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
    const buf = Buffer.from('hello world')

    ipfs.cat.withArgs(cid.toString(), defaultCatArgs({
      offset: 21,
      length: 5
    })).returns([buf])

    const out = await cli('cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB --offset 21 --count 5', { ipfs })
    expect(out).to.equal(buf.toString('utf8'))
  })

  it('cat part of a file using `length`', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
    const buf = Buffer.from('hello world')

    ipfs.cat.withArgs(cid.toString(), defaultCatArgs({
      offset: 21,
      length: 5
    })).returns([buf])

    const out = await cli('cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB --offset 21 --length 5', { ipfs })
    expect(out).to.equal(buf.toString('utf8'))
  })

  it('cat non-existent file', async () => {
    const err = new Error('wat')
    ipfs.cat.returns(async function * () { // eslint-disable-line require-await,require-yield
      throw err
    }())

    const out = await cli.fail('cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB/dummy', { ipfs })
    expect(out).to.equal(`${err.message}\n`)
  })

  it('get file', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
    const buf = Buffer.from('hello world')

    ipfs.get.withArgs(cid.toString()).returns([{
      path: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB',
      content: function * () {
        yield buf
      }
    }])

    const outPath = path.join(process.cwd(), cid.toString())
    rimraf(outPath)

    const out = await cli(`get ${cid}`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(fs.readFileSync(outPath)).to.deep.equal(buf)

    rimraf(outPath)
  })

  it('get file with output option', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
    const buf = Buffer.from('hello world')

    ipfs.get.withArgs(cid.toString()).returns([{
      path: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB',
      content: function * () {
        yield buf
      }
    }])

    const outPath = path.join(process.cwd(), 'derp')
    rimraf(outPath)

    const out = await cli(`get ${cid} --output ${outPath}`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(fs.readFileSync(path.join(outPath, cid.toString()))).to.deep.equal(buf)

    rimraf(outPath)
  })

  it('get file with short output option', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
    const buf = Buffer.from('hello world')

    ipfs.get.withArgs(cid.toString()).returns([{
      path: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB',
      content: function * () {
        yield buf
      }
    }])

    const outPath = path.join(process.cwd(), 'herp')
    rimraf(outPath)

    const out = await cli(`get ${cid} -o ${outPath}`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(fs.readFileSync(path.join(outPath, cid.toString()))).to.deep.equal(buf)

    rimraf(outPath)
  })

  it('get directory', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.get.withArgs(cid.toString()).returns([{
      path: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'
    }])

    const outPath = path.join(process.cwd(), cid.toString())
    rimraf(outPath)

    const out = await cli(`get ${cid}`, { ipfs })
    expect(out)
      .to.equal(`Saving file(s) ${cid}\n`)

    expect(fs.statSync(outPath).isDirectory()).to.be.true()

    rimraf(outPath)
  })

  it('get recursively', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
    const buf = Buffer.from('hello world')

    ipfs.get.withArgs(cid.toString()).returns([{
      path: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'
    }, {
      path: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB/foo.txt',
      content: function * () {
        yield buf
      }
    }])

    const outPath = path.join(process.cwd(), cid.toString())
    rimraf(outPath)

    const out = await cli(`get ${cid}`, { ipfs })
    expect(out).to.eql(
      `Saving file(s) ${cid}\n`
    )

    expect(fs.statSync(outPath).isDirectory()).to.be.true()
    expect(fs.statSync(path.join(outPath, 'foo.txt')).isFile()).to.be.true()
    expect(fs.readFileSync(path.join(outPath, 'foo.txt'))).to.deep.equal(buf)

    rimraf(outPath)
  })
})
