/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const CID = require('cids')
const cli = require('../utils/cli')
const sinon = require('sinon')

const defaultRefsArgs = (overrides = {}) => {
  return {
    recursive: false,
    format: '<dst>',
    edges: false,
    unique: false,
    maxDepth: undefined,
    ...overrides
  }
}

// Note: There are more comprehensive tests in interface-js-ipfs-core
describe('refs', () => {
  let ipfs
  const cid = new CID('Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z')
  const err = 'err'
  const ref = 'ref'

  beforeEach(() => {
    ipfs = {
      refs: sinon.stub()
    }
  })

  it('prints refs', async () => {
    ipfs.refs.withArgs([cid.toString()], defaultRefsArgs()).returns([{
      err
    }, {
      ref
    }])

    const out = await cli(`refs ${cid}`, { ipfs })
    expect(out).to.eql(
      `${err}\n` +
      `${ref}\n`
    )
  })

  it('prints refs with recursion', async () => {
    ipfs.refs.withArgs([cid.toString()], defaultRefsArgs({
      recursive: true
    })).returns([{
      err
    }, {
      ref
    }])

    const out = await cli(`refs --recursive ${cid}`, { ipfs })
    expect(out).to.eql(
      `${err}\n` +
      `${ref}\n`
    )
  })

  it('prints refs with recursion (short option)', async () => {
    ipfs.refs.withArgs([cid.toString()], defaultRefsArgs({
      recursive: true
    })).returns([{
      err
    }, {
      ref
    }])

    const out = await cli(`refs -r ${cid}`, { ipfs })
    expect(out).to.eql(
      `${err}\n` +
      `${ref}\n`
    )
  })

  it('prints refs with format', async () => {
    ipfs.refs.withArgs([cid.toString()], defaultRefsArgs({
      format: '<src> <dst>'
    })).returns([{
      err
    }, {
      ref
    }])

    const out = await cli(`refs --format '<src> <dst>' ${cid}`, { ipfs })
    expect(out).to.eql(
      `${err}\n` +
      `${ref}\n`
    )
  })

  it('prints refs with unique', async () => {
    ipfs.refs.withArgs([cid.toString()], defaultRefsArgs({
      unique: true
    })).returns([{
      err
    }, {
      ref
    }])

    const out = await cli(`refs --unique ${cid}`, { ipfs })
    expect(out).to.eql(
      `${err}\n` +
      `${ref}\n`
    )
  })

  it('prints refs with unique (short option)', async () => {
    ipfs.refs.withArgs([cid.toString()], defaultRefsArgs({
      unique: true
    })).returns([{
      err
    }, {
      ref
    }])

    const out = await cli(`refs -u ${cid}`, { ipfs })
    expect(out).to.eql(
      `${err}\n` +
      `${ref}\n`
    )
  })

  it('prints refs with max-depth', async () => {
    ipfs.refs.withArgs([cid.toString()], defaultRefsArgs({
      maxDepth: 4
    })).returns([{
      err
    }, {
      ref
    }])

    const out = await cli(`refs --max-depth 4 ${cid}`, { ipfs })
    expect(out).to.eql(
      `${err}\n` +
      `${ref}\n`
    )
  })
})
