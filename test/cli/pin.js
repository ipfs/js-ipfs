/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

// use a tree of ipfs objects for recursive tests:
//  root
//   |`leaf
//    `branch
//      `subLeaf

const keys = {
  root: 'QmWQwS2Xh1SFGMPzUVYQ52b7RC7fTfiaPHm3ZyTRZuHmer',
  leaf: 'QmaZoTQ6wFe7EtvaePBUeXavfeRqCAq3RUMomFxBpZLrLA',
  branch: 'QmNxjjP7dtx6pzxWGBRCrgmjX3JqKL7uF2Kjx7ExiZDbSB',
  subLeaf: 'QmUzzznkyQL7FjjBztG3D1tTjBuxeArLceDZnuSowUggXL'
}

describe('pin', () => runOnAndOff((thing) => {
  const filesDir = 'test/test-data/tree/'

  let ipfs

  before(() => {
    ipfs = thing.ipfs

    return ipfs(`object put ${filesDir + 'root.json'}`)
      .then(() => ipfs(`object put ${filesDir + 'root.json'}`))
      .then(() => ipfs(`object put ${filesDir + 'leaf.json'}`))
      .then(() => ipfs(`object put ${filesDir + 'branch.json'}`))
      .then(() => ipfs(`object put ${filesDir + 'subLeaf.json'}`))
  })

  it('add (recursively by default)', () => {
    return ipfs(`pin add ${keys.root}`).then((out) => {
      expect(out).to.eql(`pinned ${keys.root} recursively\n`)
    })
  })

  it('add (direct)', () => {
    return ipfs(`pin add ${keys.leaf} --recursive false`).then((out) => {
      expect(out).to.eql(`pinned ${keys.leaf} directly\n`)
    })
  })

  it('ls (recursive)', () => {
    return ipfs(`pin ls --path ${keys.root}`).then((out) => {
      expect(out).to.eql(`${keys.root} recursive\n`)
    })
  })

  it('ls (direct)', () => {
    return ipfs(`pin ls --path ${keys.leaf}`).then((out) => {
      expect(out).to.eql(`${keys.leaf} direct\n`)
    })
  })

  it('ls (indirect)', () => {
    return ipfs(`pin ls --path ${keys.subLeaf}`).then((out) => {
      expect(out).to.eql(`${keys.subLeaf} indirect through ${keys.root}\n`)
    })
  })

  it('ls (all)', () => {
    return ipfs('pin ls').then((out) => {
      expect(out).to.include(`${keys.leaf} direct\n`)
      expect(out).to.include(`${keys.root} recursive\n`)
      expect(out).to.include(`${keys.branch} indirect\n`)
      expect(out).to.include(`${keys.subLeaf} indirect\n`)
    })
  })

//  it('ls (quiet)', () => {
//    return ipfs('pin ls --quiet').then((out) => {
//      expect(out).to.include(`${keys.leaf}\n`)
//      expect(out).to.include(`${keys.root}\n`)
//      expect(out).to.include(`${keys.branch}\n`)
//      expect(out).to.include(`${keys.subLeaf}\n`)
//    })
//  })

  it('rm (recursively by default)', () => {
    return ipfs(`pin rm ${keys.root}`).then((out) => {
      expect(out).to.equal(`unpinned ${keys.root}\n`)
    })
  })

  it('rm (direct)', () => {
    return ipfs(`pin rm --recursive false ${keys.leaf}`).then((out) => {
      expect(out).to.equal(`unpinned ${keys.leaf}\n`)
    })
  })

  it('confirm removal', () => {
    return ipfs('pin ls').then((out) => {
      expect(out).to.equal('')
    })
  })
}))
