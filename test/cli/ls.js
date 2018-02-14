/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

describe('ls', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
    return ipfs('files add -r test/fixtures/test-data/recursive-get-dir')
  })

  it('prints added files', function () {
    this.timeout(20 * 1000)
    return ipfs('ls QmYmW4HiZhotsoSqnv2o1oUusvkRM8b9RweBoH7ao5nki2')
      .then((out) => {
        expect(out).to.eql(
          'QmQQHYDwAQms78fPcvx1uFFsfho23YJNoewfLbi9AtdyJ9 123530 blocks/\n' +
          'QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3939   config\n' +
          'Qma13ZrhKG52MWnwtZ6fMD8jGj8d4Q9sJgn5xtKgeZw5uz 5503   datastore/\n' +
          'QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU 7397   init-docs/\n' +
          'QmR56UJmAaZLXLdTT1ALrE9vVqV8soUEekm9BMd4FnuYqV 10     version\n')
      })
  })

  it(`prints nothing for non-existant hashes`, function(done) {
    this.slow(3200)
    setTimeout(done, 3000)
    ipfs('ls QmYmW4HiZhotsoSqnv2o1oSssvkRM8b9RweBoH7ao5nki2')
      .then(() => done(
        new Error('ipfs ls <invalid hash> found something when it should not have')
      ))
  })

  it('adds a header, -v', function () {
    this.timeout(20 * 1000)
    return ipfs('ls /ipfs/QmYmW4HiZhotsoSqnv2o1oUusvkRM8b9RweBoH7ao5nki2 -v')
      .then((out) => {
        expect(out).to.eql(
          'Hash                                           Size   Name\n' +
          'QmQQHYDwAQms78fPcvx1uFFsfho23YJNoewfLbi9AtdyJ9 123530 blocks/\n' +
          'QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3939   config\n' +
          'Qma13ZrhKG52MWnwtZ6fMD8jGj8d4Q9sJgn5xtKgeZw5uz 5503   datastore/\n' +
          'QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU 7397   init-docs/\n' +
          'QmR56UJmAaZLXLdTT1ALrE9vVqV8soUEekm9BMd4FnuYqV 10     version\n'
        )
      })
  })

  it('follows a path, ls <subdir>', function () {
    this.timeout(20 * 1000)

    return ipfs('ls /ipfs/QmYmW4HiZhotsoSqnv2o1oUusvkRM8b9RweBoH7ao5nki2/init-docs')
      .then((out) => {
        expect(out).to.eql(
          'QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V 1688 about\n' +
          'QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y 200  contact\n' +
          'QmegvLXxpVKiZ4b57Xs1syfBVRd8CbucVHAp7KpLQdGieC 65   docs/\n' +
          'QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7 322  help\n' +
          'QmdncfsVm2h5Kqq9hPmU7oAVX2zTSVP3L869tgTbPYnsha 1728 quick-start\n' +
          'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB 1102 readme\n' +
          'QmTumTjvcYCAvRRwQ8sDRxh8ezmrcr88YFU7iYNroGGTBZ 1027 security-notes\n' +
          'QmciSU8hfpAXKjvK5YLUSwApomGSWN5gFbP4EpDAEzu2Te 863  tour/\n'
        )
      })
  })

  it('recursively follows folders, -r', function() {
    this.slow(2000)
    this.timeout(20 * 1000)

    return ipfs('ls -r /ipfs/QmYmW4HiZhotsoSqnv2o1oUusvkRM8b9RweBoH7ao5nki2/init-docs')
      .then(out =>
        expect(out).to.eql(
`QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V 1688 about
QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y 200  contact
QmegvLXxpVKiZ4b57Xs1syfBVRd8CbucVHAp7KpLQdGieC 65   docs/
QmQN88TEidd3RY2u3dpib49fERTDfKtDpvxnvczATNsfKT 14     index
QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7 322  help
QmdncfsVm2h5Kqq9hPmU7oAVX2zTSVP3L869tgTbPYnsha 1728 quick-start
QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB 1102 readme
QmTumTjvcYCAvRRwQ8sDRxh8ezmrcr88YFU7iYNroGGTBZ 1027 security-notes
QmciSU8hfpAXKjvK5YLUSwApomGSWN5gFbP4EpDAEzu2Te 863  tour/
QmYE7xo6NxbHEVEHej1yzxijYaNY51BaeKxjXxn6Ssa6Bs 807    0.0-intro
`)
      )
  })
}))
