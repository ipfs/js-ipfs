/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { isNode } from 'ipfs-utils/src/env.js'
import { CID } from 'multiformats/cid'
import { base58btc } from 'multiformats/bases/base58'
import { cli } from '../utils/cli.js'
const fileCid = CID.parse('bafybeigyov3nzxrqjismjpq7ghkkjorcmozy5rgaikvyieakoqpxfc3rvu')

const defaultOptions = {
  withLocal: false,
  timeout: undefined
}

describe('stat', () => {
  if (!isNode) {
    return
  }

  const path = '/foo'
  let ipfs
  let print
  let output

  beforeEach(() => {
    output = ''
    ipfs = {
      files: {
        stat: sinon.stub().resolves({
          cid: fileCid,
          size: 'stats-size',
          cumulativeSize: 'stats-cumulativeSize',
          blocks: 'stats-blocks',
          type: 'stats-type',
          mode: 'stats-mode',
          mtime: 'stats-mtime'
        })
      },
      bases: {
        getBase: sinon.stub()
      }
    }
    print = (msg = '', newline = true) => {
      output += newline ? msg + '\n' : msg
    }
  })

  it('should stat a path', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    await cli(`files stat ${path}`, { ipfs, print })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.getCall(0).args).to.deep.equal([
      path,
      defaultOptions
    ])
    expect(output).to.include('CumulativeSize')
  })

  it('should stat a path with local', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    await cli(`files stat --with-local ${path}`, { ipfs, print })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        withLocal: true
      }
    ])
    expect(output).to.include('CumulativeSize')
  })

  it('should stat a path with local (short option)', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    await cli(`files stat -l ${path}`, { ipfs, print })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        withLocal: true
      }
    ])
    expect(output).to.include('CumulativeSize')
  })

  it('should stat a path and only show hashes', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    await cli(`files stat --hash ${path}`, { ipfs, print })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.getCall(0).args).to.deep.equal([
      path,
      defaultOptions
    ])
    expect(output).to.equal(`${fileCid.toString(base58btc)}\n`)
  })

  it('should stat a path and only show hashes (short option)', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    await cli(`files stat -h ${path}`, { ipfs, print })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.getCall(0).args).to.deep.equal([
      path,
      defaultOptions
    ])
    expect(output).to.equal(`${fileCid.toString(base58btc)}\n`)
  })

  it('should stat a path and only show sizes', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    await cli(`files stat --size ${path}`, { ipfs, print })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.getCall(0).args).to.deep.equal([
      path,
      defaultOptions
    ])
    expect(output).to.equal('stats-size\n')
  })

  it('should stat a path and only show sizes (short option)', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    await cli(`files stat -s ${path}`, { ipfs, print })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.getCall(0).args).to.deep.equal([
      path,
      defaultOptions
    ])
    expect(output).to.equal('stats-size\n')
  })

  it('should stat a path with format option', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    await cli(`files stat --format '<mode> <type>' ${path}`, { ipfs, print })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.getCall(0).args).to.deep.equal([
      path,
      defaultOptions
    ])
    expect(output).to.equal('---------- stats-type\n')
  })

  it('should stat a path with a timeout', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    await cli(`files stat ${path} --timeout=1s`, { ipfs, print })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        timeout: 1000
      }
    ])
    expect(output).to.include('CumulativeSize')
  })
})
