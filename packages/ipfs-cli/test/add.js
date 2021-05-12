/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const CID = require('cids')
const first = require('it-first')
const cli = require('./utils/cli')
const sinon = require('sinon')
const uint8ArrayFromString = require('uint8arrays/from-string')

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

const defaultOptions = {
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
  timeout: undefined
}

function matchIterable () {
  return sinon.match((thing) => Boolean(thing[Symbol.asyncIterator]) || Boolean(thing[Symbol.iterator]))
}

describe('add', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      addAll: sinon.stub()
    }
  })

  it('should add a file', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid: new CID(cid),
      path: 'README.md'
    }])

    const out = await cli('add --progress false README.md', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)
  })

  it('should strip control characters from paths when add a file', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid: new CID(cid),
      path: 'R\b\n\tEADME.md'
    }])

    const out = await cli('add --progress false README.md', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)
  })

  it('adds a file path with progress', async () => {
    const cid = 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid: new CID(cid),
      path: 'README.md'
    }])

    const out = await cli('add README.md', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)
  })

  it('add multiple', async () => {
    const cid1 = 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'
    const cid2 = 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'

    ipfs.addAll.withArgs(matchIterable(), {
      ...defaultOptions,
      progress: sinon.match.func,
      wrapWithDirectory: true
    }).returns([{
      cid: new CID(cid1),
      path: 'README.md'
    }, {
      cid: new CID(cid2),
      path: 'package.json'
    }])

    const out = await cli('add README.md package.json --wrap-with-directory', { ipfs })
    expect(out).to.include(`added ${cid1} README.md\n`)
    expect(out).to.include(`added ${cid2} package.json\n`)
  })

  it('add with cid-version=1', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB').toV1()

    ipfs.addAll.withArgs(matchIterable(), {
      ...defaultOptions,
      cidVersion: 1,
      rawLeaves: true
    }).returns([{
      cid,
      path: 'README.md'
    }])

    const out = await cli('add README.md --cid-version=1', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)
  })

  it('add with cid-version=1 and raw-leaves=false', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB').toV1()

    ipfs.addAll.withArgs(matchIterable(), {
      ...defaultOptions,
      cidVersion: 1,
      rawLeaves: false
    }).returns([{
      cid,
      path: 'README.md'
    }])

    const out = await cli('add README.md --cid-version=1 --raw-leaves=false', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)
  })

  it('add with cid-version=1 and raw-leaves=true', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB').toV1()

    ipfs.addAll.withArgs(matchIterable(), {
      ...defaultOptions,
      cidVersion: 1,
      rawLeaves: true
    }).returns([{
      cid,
      path: 'README.md'
    }])

    const out = await cli('add README.md --cid-version=1 --raw-leaves=true', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)
  })

  it('add from pipe', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(sinon.match([{
      content: matchIterable(),
      mtime: undefined,
      mode: undefined
    }]), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])

    const proc = cli('add', {
      ipfs,
      getStdin: function * () {
        yield uint8ArrayFromString('hello\n')
      }
    })

    const out = await proc
    expect(out).to.equal(`added ${cid} ${cid}\n`)
  })

  it('add from pipe with mtime=100', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(sinon.match([{
      content: matchIterable(),
      mtime: { secs: 100, nsecs: undefined },
      mode: undefined
    }]), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])

    const proc = cli('add --mtime=100', {
      ipfs,
      getStdin: function * () {
        yield uint8ArrayFromString('hello\n')
      }
    })

    const out = await proc
    expect(out).to.equal(`added ${cid} ${cid}\n`)
  })

  it('add --quiet', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])

    const out = await cli('add --quiet README.md', { ipfs })
    expect(out).to.equal(`${cid}\n`)
  })

  it('add --quiet (short option)', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])

    const out = await cli('add -q README.md', { ipfs })
    expect(out).to.equal(`${cid}\n`)
  })

  it('add --quieter', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])

    const out = await cli('add --quieter README.md', { ipfs })
    expect(out).to.equal(`${cid}\n`)
  })

  it('add --quieter (short option)', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])

    const out = await cli('add -Q README.md', { ipfs })
    expect(out).to.equal(`${cid}\n`)
  })

  it('add --silent', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])

    const out = await cli('add --silent README.md', { ipfs })
    expect(out).to.be.empty()
  })

  it('add --only-hash outputs correct hash', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), {
      ...defaultOptions,
      onlyHash: true
    }).returns([{
      cid,
      path: 'README.md'
    }])

    const out = await cli('add --only-hash README.md', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)
  })

  it('add does not pin with --pin=false', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), {
      ...defaultOptions,
      pin: false
    }).returns([{
      cid,
      path: 'README.md'
    }])

    const out = await cli('add --pin false README.md', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)
  })

  it('add with mtime', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])

    const out = await cli('add --mtime 5 README.md', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)

    const source = ipfs.addAll.getCall(0).args[0]
    const input = await first(source)
    expect(input).to.have.nested.property('mtime.secs', 5)
  })

  it('add with mtime-nsecs', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])

    const out = await cli('add --mtime 5 --mtime-nsecs 100 README.md', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)

    const source = ipfs.addAll.getCall(0).args[0]
    const input = await first(source)
    expect(input).to.have.nested.property('mtime.secs', 5)
    expect(input).to.have.nested.property('mtime.nsecs', 100)
  })

  it('add with mode', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])

    const out = await cli('add --mode 0655 README.md', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)

    const source = ipfs.addAll.getCall(0).args[0]
    const input = await first(source)
    expect(input).to.have.property('mode', '0655')
  })

  HASH_ALGS.forEach((name) => {
    it(`add with hash=${name} and raw-leaves=false`, async () => {
      const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

      ipfs.addAll.withArgs(matchIterable(), {
        ...defaultOptions,
        hashAlg: name,
        rawLeaves: false
      }).returns([{
        cid,
        path: 'README.md'
      }])

      const out = await cli(`add README.md --hash=${name} --raw-leaves=false`, { ipfs })
      expect(out).to.equal(`added ${cid} README.md\n`)
    })
  })

  it('should add and print CID encoded in specified base', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])

    const out = await cli('add  --cid-base=base64 README.md', { ipfs })
    expect(out).to.equal(`added ${cid.toV1().toString('base64')} README.md\n`)
  })

  it('should add with a timeout', async () => {
    const cid = new CID('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), {
      ...defaultOptions,
      timeout: 1000
    }).returns([{
      cid,
      path: 'README.md'
    }])

    const out = await cli('add  README.md --timeout=1s', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)
  })
})
