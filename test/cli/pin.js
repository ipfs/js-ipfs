/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

// file structure for recursive tests:
//  root (init-docs)
//   |`readme
//    `docs
//      `index

const keys = {
  root: 'QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU',
  readme: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB',
  docs: 'QmegvLXxpVKiZ4b57Xs1syfBVRd8CbucVHAp7KpLQdGieC',
  index: 'QmQN88TEidd3RY2u3dpib49fERTDfKtDpvxnvczATNsfKT'
}

describe('pin', () => runOnAndOff((thing) => {
  const filesDir = 'test/fixtures/test-data/recursive-get-dir/init-docs'

  let ipfs

  before(() => {
    ipfs = thing.ipfs
    return ipfs(`files add -r ${filesDir}`)
  })

  // rm first because `files add` should pin recursively by default
  it('rm (recursively by default)', () => {
    return ipfs(`pin rm ${keys.root}`)
      .then((out) => expect(out).to.equal(`unpinned ${keys.root}\n`))
      .then(() => ipfs('pin ls'))
      .then((out) => expect(out).to.equal(''))
  })

  it('add (recursively by default)', () => {
    return ipfs(`pin add ${keys.root}`).then((out) => {
      expect(out).to.eql(`pinned ${keys.root} recursively\n`)
    })
  })

  it('add (direct)', () => {
    return ipfs(`pin add ${keys.readme} --recursive false`).then((out) => {
      expect(out).to.eql(`pinned ${keys.readme} directly\n`)
    })
  })

  it('ls (recursive)', () => {
    return ipfs(`pin ls ${keys.root}`).then((out) => {
      expect(out).to.eql(`${keys.root} recursive\n`)
    })
  })

  it('ls (direct)', () => {
    return ipfs(`pin ls ${keys.readme}`).then((out) => {
      expect(out).to.eql(`${keys.readme} direct\n`)
    })
  })

  it('ls (indirect)', () => {
    return ipfs(`pin ls ${keys.index}`).then((out) => {
      expect(out).to.eql(`${keys.index} indirect through ${keys.root}\n`)
    })
  })

  it('ls with multiple keys', () => {
    return ipfs(`pin ls ${keys.root} ${keys.readme}`).then((out) => {
      expect(out).to.eql(`${keys.root} recursive\n${keys.readme} direct\n`)
    })
  })

  it('ls (all)', () => {
    return ipfs('pin ls').then((out) => {
      expect(out.split('\n').length).to.eql(12)
      expect(out).to.include(`${keys.root} recursive\n`)
      expect(out).to.include(`${keys.readme} direct\n`)
      expect(out).to.include(`${keys.docs} indirect\n`)
      expect(out).to.include(`${keys.index} indirect\n`)
    })
  })

  it('rm (direct)', () => {
    return ipfs(`pin rm --recursive false ${keys.readme}`)
      .then((out) => expect(out).to.equal(`unpinned ${keys.readme}\n`))
      .then(() => ipfs('pin ls'))
      .then((out) => expect(out).to.not.include(`${keys.readme} direct\n`))
  })
}))
