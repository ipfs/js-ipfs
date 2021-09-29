/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { isNode } from 'ipfs-utils/src/env.js'
import { cli } from '../utils/cli.js'

const defaultOptions = {
  offset: undefined,
  length: undefined,
  timeout: undefined
}

describe('read', () => {
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
        read: sinon.stub().returns(['hello world'])
      }
    }
    print = (msg = '', newline = true) => {
      output += newline ? msg + '\n' : msg
    }
  })

  it('should read a path', async () => {
    await cli(`files read ${path}`, { ipfs, print })

    expect(ipfs.files.read.callCount).to.equal(1)
    expect(ipfs.files.read.getCall(0).args).to.deep.equal([
      path,
      defaultOptions
    ])
    expect(output).to.equal('hello world')
  })

  it('should read a path with an offset', async () => {
    const offset = 5

    await cli(`files read --offset ${offset} ${path}`, { ipfs, print })

    expect(ipfs.files.read.callCount).to.equal(1)
    expect(ipfs.files.read.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        offset
      }
    ])
    expect(output).to.equal('hello world')
  })

  it('should read a path with an offset (short option)', async () => {
    const offset = 5

    await cli(`files read -o ${offset} ${path}`, { ipfs, print })

    expect(ipfs.files.read.callCount).to.equal(1)
    expect(ipfs.files.read.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        offset
      }
    ])
    expect(output).to.equal('hello world')
  })

  it('should read a path with a length', async () => {
    const length = 5

    await cli(`files read --length ${length} ${path}`, { ipfs, print })

    expect(ipfs.files.read.callCount).to.equal(1)
    expect(ipfs.files.read.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        length
      }
    ])
    expect(output).to.equal('hello world')
  })

  it('should read a path with a length (short option)', async () => {
    const length = 5

    await cli(`files read -l ${length} ${path}`, { ipfs, print })

    expect(ipfs.files.read.callCount).to.equal(1)
    expect(ipfs.files.read.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        length
      }
    ])
    expect(output).to.equal('hello world')
  })

  it('should read a path with a timeout', async () => {
    await cli(`files read ${path} --timeout=1s`, { ipfs, print })

    expect(ipfs.files.read.callCount).to.equal(1)
    expect(ipfs.files.read.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        timeout: 1000
      }
    ])
    expect(output).to.equal('hello world')
  })
})
