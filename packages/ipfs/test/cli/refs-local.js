/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const cli = require('../utils/cli')
const sinon = require('sinon')
const multibase = require('multibase')
const uint8ArrayFromString = require('uint8arrays/from-string')

const defaultOptions = {
  timeout: undefined
}

describe('refs local', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      refs: {
        local: sinon.stub()
      }
    }
  })

  it('prints CID of all blocks', async () => {
    const ref = 'ref'
    const err = 'err'

    ipfs.refs.local.withArgs(defaultOptions).returns([{
      ref
    }, {
      err
    }])

    const out = await cli('refs local', { ipfs })
    const lines = out.split('\n')

    expect(lines.includes(ref)).to.be.true()
    expect(lines.includes(err)).to.be.true()
  })

  it('prints multihash of all blocks', async () => {
    const ref = 'ref'
    const err = 'err'

    ipfs.refs.local.withArgs(defaultOptions).returns([{
      ref
    }, {
      err
    }])

    const out = await cli('refs local --multihash', { ipfs })
    const lines = out.split('\n')

    expect(lines.includes(multibase.encoding('base32upper').encode(uint8ArrayFromString(ref)))).to.be.true()
    expect(lines.includes(err)).to.be.true()
  })

  it('prints CID of all blocks with timeout', async () => {
    const ref = 'ref'
    const err = 'err'

    ipfs.refs.local.withArgs({
      ...defaultOptions,
      timeout: 1000
    }).returns([{
      ref
    }, {
      err
    }])

    const out = await cli('refs local --timeout=1s', { ipfs })
    const lines = out.split('\n')

    expect(lines.includes(ref)).to.be.true()
    expect(lines.includes(err)).to.be.true()
  })
})
