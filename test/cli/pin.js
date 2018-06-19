/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

// fixture structure:
//  planets/
//   solar-system.md
//   mercury/
//    wiki.md
const fixturePath = 'test/fixtures/planets'
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
    return ipfs(`files add -r ${fixturePath}`)
  })

  describe('rm', function () {
    it('recursively (default)', function () {
      this.timeout(10 * 1000)
      return ipfs(`pin rm ${pins.root}`)
        .then(out => expect(out).to.equal(`unpinned ${pins.root}\n`))
    })
  })

  describe('add', function () {
    it('recursively (default)', () => {
      return ipfs(`pin add ${pins.root}`)
        .then(out =>
          expect(out).to.eql(`pinned ${pins.root} recursively\n`)
        )
    })

    it('direct', () => {
      return ipfs(`pin add ${pins.solarWiki} --recursive false`)
        .then(out =>
          expect(out).to.eql(`pinned ${pins.solarWiki} directly\n`)
        )
    })
  })

  describe('ls', function () {
    it('lists all pins when no hash is passed', function () {
      return ipfs('pin ls -q').then(out => {
        const results = out.split('\n')
        expect(results).to.include.members(Object.values(pins))
      })
    })

    it('handles multiple hashes', function () {
      return ipfs(`pin ls ${pins.root} ${pins.solarWiki}`)
        .then(out => {
          expect(out).to.eql(
            `${pins.root} recursive\n${pins.solarWiki} direct\n`
          )
        })
    })

    it('can print quietly', function () {
      return ipfs('pin ls -q').then(out => {
        const firstLineParts = out.split(/\s/)[0].split(' ')
        expect(firstLineParts).to.have.length(1)
      })
    })
  })
}))
