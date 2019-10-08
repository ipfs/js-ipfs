/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const runOnAndOff = require('../utils/on-and-off')

describe('refs-local', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
    return ipfs('add -r test/fixtures/test-data/recursive-get-dir')
  })

  it('prints CID of all blocks', async function () {
    this.timeout(20 * 1000)

    const out = await ipfs('refs-local')
    const lines = out.split('\n')

    expect(lines.includes('bafkreicjl7v3vyyv4zlryihez5xhunqmriry6styhil7z5lhd3r4prnz6y')).to.eql(true)
    expect(lines.includes('bafkreidj5bovvm25wszvajfshj7m7m2efpswcs6dsz7giz52ovlquxc4o4')).to.eql(true)
  })
}))
