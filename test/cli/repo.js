/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const fs = require('fs')
const os = require('os')
const path = require('path')
const repoVersion = require('ipfs-repo').repoVersion
const hat = require('hat')
const clean = require('../utils/clean')

const runOnAndOff = require('../utils/on-and-off')

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
  it('should run garbage collection', async () => {
    // Create and add a file to IPFS
    const filePath = path.join(os.tmpdir(), hat())
    const content = String(Math.random())
    fs.writeFileSync(filePath, content)
    const cid = (await ipfs(`add -Q ${filePath}`)).trim()

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

    // Clean up file
    await clean(filePath)
  })
}))
