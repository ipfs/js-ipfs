/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { CID } from 'multiformats/cid'
import { base58btc } from 'multiformats/bases/base58'
import { base64 } from 'multiformats/bases/base64'
import first from 'it-first'
import { cli } from './utils/cli.js'
import sinon from 'sinon'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { matchIterable } from './utils/match-iterable.js'
import all from 'it-all'
import map from 'it-map'

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

describe('add', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      addAll: sinon.stub(),
      bases: {
        getBase: sinon.stub()
      }
    }
  })

  it('should add a file', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add --progress false README.md', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)

    const files = await all(map(ipfs.addAll.getCall(0).args[0], (file) => file.path))
    expect(files).to.deep.equal([
      'README.md'
    ])
  })

  it('should add a directory', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'bitswap/index.js'
    }, {
      cid,
      path: 'bitswap/unwant.js'
    }, {
      cid,
      path: 'bitswap/wantlist.js'
    }, {
      cid,
      path: 'bitswap/stat.js'
    }, {
      cid,
      path: 'bitswap'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add --recursive src/commands/bitswap', { ipfs })
    expect(out).to.include(`added ${cid} bitswap/index.js\n`)
    expect(out).to.include(`added ${cid} bitswap/unwant.js\n`)
    expect(out).to.include(`added ${cid} bitswap/wantlist.js\n`)
    expect(out).to.include(`added ${cid} bitswap/stat.js\n`)
    expect(out).to.include(`added ${cid} bitswap\n`)

    const files = await all(map(ipfs.addAll.getCall(0).args[0], (file) => file.path))
    expect(files.sort()).to.deep.equal([
      'bitswap/index.js',
      'bitswap/unwant.js',
      'bitswap/wantlist.js',
      'bitswap/stat.js'
    ].sort())
  })

  it('should strip control characters from paths when add a file', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'R\b\n\tEADME.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add --progress false README.md', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)
  })

  it('adds a file path with progress', async () => {
    const cid = 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add README.md', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)
  })

  it('add multiple', async () => {
    const cid1 = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
    const cid2 = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')

    ipfs.addAll.withArgs(matchIterable(), {
      ...defaultOptions,
      progress: sinon.match.func,
      wrapWithDirectory: true
    }).returns([{
      cid: cid1,
      path: 'README.md'
    }, {
      cid: cid2,
      path: 'package.json'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add README.md package.json --wrap-with-directory', { ipfs })
    expect(out).to.include(`added ${cid1} README.md\n`)
    expect(out).to.include(`added ${cid2} package.json\n`)
  })

  it('add with cid-version=1', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB').toV1()

    ipfs.addAll.withArgs(matchIterable(), {
      ...defaultOptions,
      cidVersion: 1,
      rawLeaves: true
    }).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add README.md --cid-version=1', { ipfs })
    expect(out).to.equal(`added ${cid.toString(base58btc)} README.md\n`)
  })

  it('add with cid-version=1 and raw-leaves=false', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB').toV1()

    ipfs.addAll.withArgs(matchIterable(), {
      ...defaultOptions,
      cidVersion: 1,
      rawLeaves: false
    }).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add README.md --cid-version=1 --raw-leaves=false', { ipfs })
    expect(out).to.equal(`added ${cid.toString(base58btc)} README.md\n`)
  })

  it('add with cid-version=1 and raw-leaves=true', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB').toV1()

    ipfs.addAll.withArgs(matchIterable(), {
      ...defaultOptions,
      cidVersion: 1,
      rawLeaves: true
    }).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add README.md --cid-version=1 --raw-leaves=true', { ipfs })
    expect(out).to.equal(`added ${cid.toString(base58btc)} README.md\n`)
  })

  it('add from pipe', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(sinon.match([{
      content: matchIterable(),
      mtime: undefined,
      mode: undefined
    }]), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

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
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(sinon.match([{
      content: matchIterable(),
      mtime: { secs: 100, nsecs: undefined },
      mode: undefined
    }]), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

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
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add --quiet README.md', { ipfs })
    expect(out).to.equal(`${cid}\n`)
  })

  it('add --quiet (short option)', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add -q README.md', { ipfs })
    expect(out).to.equal(`${cid}\n`)
  })

  it('add --quieter', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add --quieter README.md', { ipfs })
    expect(out).to.equal(`${cid}\n`)
  })

  it('add --quieter (short option)', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add -Q README.md', { ipfs })
    expect(out).to.equal(`${cid}\n`)
  })

  it('add --silent', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add --silent README.md', { ipfs })
    expect(out).to.be.empty()
  })

  it('add --only-hash outputs correct hash', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), {
      ...defaultOptions,
      onlyHash: true
    }).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add --only-hash README.md', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)
  })

  it('add does not pin with --pin=false', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), {
      ...defaultOptions,
      pin: false
    }).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add --pin false README.md', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)
  })

  it('add with mtime', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add --mtime 5 README.md', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)

    const source = ipfs.addAll.getCall(0).args[0]
    const input = await first(source)
    expect(input).to.have.nested.property('mtime.secs', 5)
  })

  it('add with mtime-nsecs', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add --mtime 5 --mtime-nsecs 100 README.md', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)

    const source = ipfs.addAll.getCall(0).args[0]
    const input = await first(source)
    expect(input).to.have.nested.property('mtime.secs', 5)
    expect(input).to.have.nested.property('mtime.nsecs', 100)
  })

  it('add with mode', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add --mode 0655 README.md', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)

    const source = ipfs.addAll.getCall(0).args[0]
    const input = await first(source)
    expect(input).to.have.property('mode', '0655')
  })

  HASH_ALGS.forEach((name) => {
    it(`add with hash=${name} and raw-leaves=false`, async () => {
      const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

      ipfs.addAll.withArgs(matchIterable(), {
        ...defaultOptions,
        hashAlg: name,
        rawLeaves: false
      }).returns([{
        cid,
        path: 'README.md'
      }])
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli(`add README.md --hash=${name} --raw-leaves=false`, { ipfs })
      expect(out).to.equal(`added ${cid} README.md\n`)
    })
  })

  it('should add and print CID encoded in specified base', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB').toV1()

    ipfs.addAll.withArgs(matchIterable(), {
      ...defaultOptions,
      rawLeaves: true,
      cidVersion: 1
    }).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base64').returns(base64)

    const out = await cli('add --cid-base=base64 --cid-version=1 README.md', { ipfs })
    expect(out).to.equal(`added ${cid.toString(base64)} README.md\n`)
  })

  it('should add with a timeout', async () => {
    const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    ipfs.addAll.withArgs(matchIterable(), {
      ...defaultOptions,
      timeout: 1000
    }).returns([{
      cid,
      path: 'README.md'
    }])
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('add  README.md --timeout=1s', { ipfs })
    expect(out).to.equal(`added ${cid} README.md\n`)
  })
})
