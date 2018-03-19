/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

// file structure for recursive tests:
//  root (planets/)
//   |`solar-system
//    `mercury
//      `wiki

const keys = {
  root: 'QmTAMavb995EHErSrKo7mB8dYkpaSJxu6ys1a6XJyB2sys',
  mercuryDir: 'QmbJCNKXJqVK8CzbjpNFz2YekHwh3CSHpBA86uqYg3sJ8q',
  mercuryWiki: 'QmVgSHAdMxFAuMP2JiMAYkB8pCWP1tcB9djqvq8GKAFiHi',
  solarSystem: 'QmTMbkDfvHwq3Aup6Nxqn3KKw9YnoKzcZvuArAfQ9GF3QG'
}

describe('pin', () => runOnAndOff.off((thing) => {
  // const filesDir = 'test/fixtures/test-data/recursive-get-dir/init-mercuryDir'
  const filesDir = 'test/fixtures/planets'

  let ipfs

  before(function () {
    this.timeout(15 * 1000)
    ipfs = thing.ipfs

    return ipfs(`files add -r ${filesDir}`)
  })

  describe('rm', function () {
    it('recursively (default)', function () {
      this.timeout(10 * 1000)
      return ipfs(`pin rm ${keys.root}`)
        .then(out => expect(out).to.equal(`unpinned ${keys.root}\n`))
        .then(() => ipfs('pin ls'))
        .then(out => {
          Object.values(keys).forEach(hash => expect(out).to.not.include(hash))
        })
    })

    // it('direct', () => {
    //   return ipfs(`pin rm --recursive false ${keys.solarSystem}`)
    //     .then(out => expect(out).to.equal(`unpinned ${keys.solarSystem}\n`))
    //     .then(() => ipfs('pin ls'))
    //     .then(out => expect(out).to.not.include(`${keys.solarSystem} direct\n`))
    // })
  })

  describe('add', function () {
    it('recursively (default)', () => {
      return ipfs(`pin add ${keys.root}`).then(out => {
        expect(out).to.eql(`pinned ${keys.root} recursively\n`)
      })
    })

    it('direct', () => {
      return ipfs(`pin add ${keys.solarSystem} --recursive false`).then(out => {
        expect(out).to.eql(`pinned ${keys.solarSystem} indirectly\n`)
      })
    })
  })

  describe('ls', function () {
    it('lists recursive pins', () => {
      return ipfs(`pin ls ${keys.root}`).then(out => {
        expect(out).to.eql(`${keys.root} recursive\n`)
      })
    })

    it('lists direct pins', () => {
      return ipfs(`pin ls ${keys.solarSystem}`).then(out => {
        expect(out).to.eql(`${keys.solarSystem} direct\n`)
      })
    })

    it('lists indirect pins', function () {
      this.timeout(25 * 1000)

      return ipfs('pin ls').then(out => {
        console.log('pin ls out:', out)
        return ipfs(`pin ls ${keys.mercuryWiki}`).then(out => {
          console.log('ls mercuryWiki:', out)
          expect(out).to.include(keys.mercuryWiki)
        })
      })
    })

    it('handles multiple hashes', () => {
      return ipfs(`pin ls ${keys.root} ${keys.solarSystem}`).then(out => {
        expect(out).to.eql(`${keys.root} recursive\n${keys.solarSystem} direct\n`)
      })
    })

    it('lists all pins when no hash is passed', () => {
      return ipfs('pin ls').then(out => {
        const hashes = out.split('\n').map(line => line.split(' ')[0])
        expect(hashes).to.include.members(Object.values(keys))
      })
    })
  })
}))
