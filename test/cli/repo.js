/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const repoVersion = require('ipfs-repo').repoVersion
const runOnAndOff = require('../utils/on-and-off')

const fixturePath = 'test/fixtures/planets/solar-system.md'

describe('repo', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('get the repo version', () => {
    return ipfs('repo version').then((out) => {
      expect(out).to.eql(`${repoVersion}\n`)
    })
  })

  // Note: There are more comprehensive GC tests in interface-js-ipfs-core
  it('should run garbage collection', async function () {
    this.timeout(60000)

    // Add a file to IPFS
    const cid = (await ipfs(`add -Q ${fixturePath}`)).trim()

    // File hash should be in refs local
    const localRefs = await ipfs('refs local')
    expect(localRefs.split('\n')).includes(cid)

    // Run GC, file should not have been removed because it's pinned
    const gcOut = await ipfs('repo gc')
    expect(gcOut.split('\n')).not.includes('Removed ' + cid)

    // Unpin file
    await ipfs('pin rm ' + cid)

    // Run GC, file should now be removed
    const gcOutAfterUnpin = await ipfs('repo gc')
    expect(gcOutAfterUnpin.split('\n')).to.includes('Removed ' + cid)

    const localRefsAfterGc = await ipfs('refs local')
    expect(localRefsAfterGc.split('\n')).not.includes(cid)
  })
}))
