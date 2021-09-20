/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { CID } from 'multiformats/cid'
import { cli } from './utils/cli.js'
import sinon from 'sinon'

const defaultOptions = {
  recursive: false,
  format: '<dst>',
  edges: false,
  unique: false,
  maxDepth: undefined,
  timeout: undefined
}

// Note: There are more comprehensive tests in interface-js-ipfs-core
describe('refs', () => {
  let ipfs
  const cid = CID.parse('Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z')
  const err = 'err'
  const ref = 'ref'

  beforeEach(() => {
    ipfs = {
      refs: sinon.stub()
    }
  })

  it('prints refs', async () => {
    ipfs.refs.withArgs([cid.toString()], defaultOptions).returns([{
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
    ipfs.refs.withArgs([cid.toString()], {
      ...defaultOptions,
      recursive: true
    }).returns([{
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
    ipfs.refs.withArgs([cid.toString()], {
      ...defaultOptions,
      recursive: true
    }).returns([{
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
    ipfs.refs.withArgs([cid.toString()], {
      ...defaultOptions,
      format: '<src> <dst>'
    }).returns([{
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
    ipfs.refs.withArgs([cid.toString()], {
      ...defaultOptions,
      unique: true
    }).returns([{
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
    ipfs.refs.withArgs([cid.toString()], {
      ...defaultOptions,
      unique: true
    }).returns([{
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
    ipfs.refs.withArgs([cid.toString()], {
      ...defaultOptions,
      maxDepth: 4
    }).returns([{
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

  it('prints refs with timeout', async () => {
    ipfs.refs.withArgs([cid.toString()], {
      ...defaultOptions,
      timeout: 1000
    }).returns([{
      err
    }, {
      ref
    }])

    const out = await cli(`refs --timeout=1s ${cid}`, { ipfs })
    expect(out).to.eql(
      `${err}\n` +
      `${ref}\n`
    )
  })
})
