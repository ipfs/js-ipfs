/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const CID = require('cids')
const runOnAndOff = require('../utils/on-and-off')
const path = require('path')

// fixture structure:
//  planets/
//   solar-system.md
//   mercury/
//    wiki.md
const fixturePath = path.resolve(path.join(__dirname, '..'), 'fixtures/planets')

const pins = {
  root: 'QmTAMavb995EHErSrKo7mB8dYkpaSJxu6ys1a6XJyB2sys',
  solarWiki: 'QmTMbkDfvHwq3Aup6Nxqn3KKw9YnoKzcZvuArAfQ9GF3QG',
  mercuryDir: 'QmbJCNKXJqVK8CzbjpNFz2YekHwh3CSHpBA86uqYg3sJ8q',
  mercuryWiki: 'QmVgSHAdMxFAuMP2JiMAYkB8pCWP1tcB9djqvq8GKAFiHi'
}

describe('pin', () => runOnAndOff(thing => {
  let ipfs

  before(function () {
    this.timeout(15 * 1000)
    ipfs = thing.ipfs
    return ipfs(`add -r ${fixturePath}`)
  })

  describe('rm', function () {
    it('recursively (default)', async () => {
      const out = await ipfs(`pin rm ${pins.root}`)
      expect(out).to.equal(`unpinned ${pins.root}\n`)
    })

    it('should rm and print CIDs encoded in specified base', async function () {
      this.timeout(30 * 1000)

      await ipfs(`add -r ${fixturePath}`)
      const out = await ipfs(`pin rm ${pins.root} --cid-base=base64`)
      const b64CidStr = new CID(pins.root).toV1().toBaseEncodedString('base64')
      expect(out).to.eql(`unpinned ${b64CidStr}\n`)
    })
  })

  describe('add', function () {
    it('recursively (default)', async () => {
      const out = await ipfs(`pin add ${pins.root}`)
      expect(out).to.eql(`pinned ${pins.root} recursively\n`)
    })

    it('direct', async () => {
      const out = await ipfs(`pin add ${pins.solarWiki} --recursive false`)
      expect(out).to.eql(`pinned ${pins.solarWiki} directly\n`)
    })

    it('should add and print CIDs encoded in specified base', async () => {
      const out = await ipfs(`pin add ${pins.root} --cid-base=base64`)
      const b64CidStr = new CID(pins.root).toV1().toBaseEncodedString('base64')
      expect(out).to.eql(`pinned ${b64CidStr} recursively\n`)
    })
  })

  describe('ls', function () {
    it('lists all pins when no hash is passed', async () => {
      const out = await ipfs('pin ls -q')
      const results = out.split('\n')
      expect(results).to.include.members(Object.values(pins))
    })

    it('handles multiple hashes', async () => {
      const out = await ipfs(`pin ls ${pins.root} ${pins.solarWiki}`)
      expect(out).to.eql(
        `${pins.root} recursive\n${pins.solarWiki} direct\n`
      )
    })

    it('can print quietly', async () => {
      const out = await ipfs('pin ls -q')
      const firstLineParts = out.split(/\s/)[0].split(' ')
      expect(firstLineParts).to.have.length(1)
    })

    it('should ls and print CIDs encoded in specified base', async () => {
      const out = await ipfs(`pin ls ${pins.root} --cid-base=base64`)
      const b64CidStr = new CID(pins.root).toV1().toBaseEncodedString('base64')
      expect(out).to.eql(`${b64CidStr} recursive\n`)
    })
  })
}))
