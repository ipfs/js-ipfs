/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const cli = require('../utils/cli')
const sinon = require('sinon')

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

    ipfs.refs.local.returns([{
      ref
    }, {
      err
    }])

    const out = await cli('refs local', { ipfs })
    const lines = out.split('\n')

    expect(lines.includes(ref)).to.be.true()
    expect(lines.includes(err)).to.be.true()
  })
})
