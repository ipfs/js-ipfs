/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { isNode } from 'ipfs-utils/src/env.js'
import { cli } from '../utils/cli.js'

const defaultOptions = {
  recursive: false,
  timeout: undefined
}

describe('rm', () => {
  if (!isNode) {
    return
  }

  const path = '/foo'
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        rm: sinon.stub().resolves()
      }
    }
  })

  it('should remove a path', async () => {
    await cli(`files rm ${path}`, { ipfs })

    expect(ipfs.files.rm.callCount).to.equal(1)
    expect(ipfs.files.rm.getCall(0).args).to.deep.equal([
      path,
      defaultOptions
    ])
  })

  it('should remove a path recursively', async () => {
    await cli(`files rm --recursive ${path}`, { ipfs })

    expect(ipfs.files.rm.callCount).to.equal(1)
    expect(ipfs.files.rm.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        recursive: true
      }
    ])
  })

  it('should remove a path recursively (short option)', async () => {
    await cli(`files rm -r ${path}`, { ipfs })

    expect(ipfs.files.rm.callCount).to.equal(1)
    expect(ipfs.files.rm.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        recursive: true
      }
    ])
  })

  it('should remove a path with a timeout', async () => {
    await cli(`files rm ${path} --timeout=1s`, { ipfs })

    expect(ipfs.files.rm.callCount).to.equal(1)
    expect(ipfs.files.rm.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        timeout: 1000
      }
    ])
  })
})
