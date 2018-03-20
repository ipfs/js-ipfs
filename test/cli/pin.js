/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

// fixture structure:
//  planets/
//   solar-system.md
//   mercury/
//    wiki.md
const fixturePath = 'test/fixtures/planets'
const hashes = {
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
        return ipfs(`pin rm ${hashes.root}`)
          .then(out => expect(out).to.equal(`unpinned ${hashes.root}\n`))
      })
    })

    describe('add', function () {
      it('recursively (default)', () => {
        return ipfs(`pin add ${hashes.root}`)
          .then(out =>
            expect(out).to.eql(`pinned ${hashes.root} recursively\n`)
          )
      })

      it('direct', () => {
        return ipfs(`pin add ${hashes.solarWiki} --recursive false`)
          .then(out =>
            expect(out).to.eql(`pinned ${hashes.solarWiki} directly\n`)
          )
      })
    })

    describe('ls', function () {
      it('lists all pins when no hash is passed', function () {
        return ipfs('pin ls -q').then(out => {
          const results = out.split('\n')
          expect(results).to.include.members(Object.values(hashes))
        })
      })

      it('handles multiple hashes', function () {
        return ipfs(`pin ls ${hashes.root} ${hashes.solarWiki}`)
          .then(out => {
            expect(out).to.eql(
              `${hashes.root} recursive\n${hashes.solarWiki} direct\n`
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
