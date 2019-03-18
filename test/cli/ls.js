/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

describe('ls', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
    return ipfs('add -r test/fixtures/test-data/recursive-get-dir')
  })

  it('prints added files', function () {
    this.timeout(20 * 1000)
    return ipfs('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z')
      .then((out) => {
        expect(out).to.eql(
          'QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT -    blocks/\n' +
          'QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n' +
          'QmUqyZtPmsRy1U5Mo8kz2BAMmk1hfJ7yW1KAFTMB2odsFv -    datastore/\n' +
          'QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU -    init-docs/\n' +
          'QmR56UJmAaZLXLdTT1ALrE9vVqV8soUEekm9BMd4FnuYqV 2    version\n'
        )
      })
  })

  it('prints nothing for non-existant hashes', function () {
    // If the daemon is off, ls should fail
    // If the daemon is on, ls should search until it hits a timeout
    return Promise.race([
      ipfs.fail('ls QmYmW4HiZhotsoSqnv2o1oSssvkRM8b9RweBoH7ao5nki2'),
      new Promise((resolve, reject) => setTimeout(resolve, 4000))
    ])
      .catch(() => expect.fail(0, 1, 'Should have thrown or timedout'))
  })

  it('adds a header, -v', function () {
    this.timeout(20 * 1000)
    return ipfs('ls /ipfs/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z -v')
      .then((out) => {
        expect(out).to.eql(
          'Hash                                           Size Name\n' +
          'QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT -    blocks/\n' +
          'QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n' +
          'QmUqyZtPmsRy1U5Mo8kz2BAMmk1hfJ7yW1KAFTMB2odsFv -    datastore/\n' +
          'QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU -    init-docs/\n' +
          'QmR56UJmAaZLXLdTT1ALrE9vVqV8soUEekm9BMd4FnuYqV 2    version\n'
        )
      })
  })

  it('follows a path, <hash>/<subdir>', function () {
    this.timeout(20 * 1000)

    return ipfs('ls /ipfs/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z/init-docs')
      .then((out) => {
        expect(out).to.eql(
          'QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V 1677 about\n' +
          'QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y 189  contact\n' +
          'QmegvLXxpVKiZ4b57Xs1syfBVRd8CbucVHAp7KpLQdGieC -    docs/\n' +
          'QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7 311  help\n' +
          'QmdncfsVm2h5Kqq9hPmU7oAVX2zTSVP3L869tgTbPYnsha 1717 quick-start\n' +
          'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB 1091 readme\n' +
          'QmTumTjvcYCAvRRwQ8sDRxh8ezmrcr88YFU7iYNroGGTBZ 1016 security-notes\n' +
          'QmciSU8hfpAXKjvK5YLUSwApomGSWN5gFbP4EpDAEzu2Te -    tour/\n'
        )
      })
  })

  it('recursively follows folders, -r', function () {
    this.slow(2000)
    this.timeout(20 * 1000)

    return ipfs('ls -r /ipfs/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z/init-docs')
      .then(out => {
        expect(out).to.eql(
          'QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V 1677 about\n' +
          'QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y 189  contact\n' +
          'QmegvLXxpVKiZ4b57Xs1syfBVRd8CbucVHAp7KpLQdGieC -    docs/\n' +
          'QmQN88TEidd3RY2u3dpib49fERTDfKtDpvxnvczATNsfKT 6      index\n' +
          'QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7 311  help\n' +
          'QmdncfsVm2h5Kqq9hPmU7oAVX2zTSVP3L869tgTbPYnsha 1717 quick-start\n' +
          'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB 1091 readme\n' +
          'QmTumTjvcYCAvRRwQ8sDRxh8ezmrcr88YFU7iYNroGGTBZ 1016 security-notes\n' +
          'QmciSU8hfpAXKjvK5YLUSwApomGSWN5gFbP4EpDAEzu2Te -    tour/\n' +
          'QmYE7xo6NxbHEVEHej1yzxijYaNY51BaeKxjXxn6Ssa6Bs 796    0.0-intro\n'
        )
      })
  })

  it('should ls and print CIDs encoded in specified base', function () {
    this.timeout(20 * 1000)

    return ipfs('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z --cid-base=base64')
      .then((out) => {
        expect(out).to.eql(
          'mAXASILidvV1YroHLqBvmuXko1Ly1UVenZV1K+MvhsjXhdvZQ -    blocks/\n' +
          'mAXASIBT4ZYkQw0IApLoNHBxSjpezyayKZHJyxmFKpt0I3sK5 3928 config\n' +
          'mAXASIGCpScP8zpa0CqUgyVCR/Cm0Co8pnULGe3seXSsOnJsJ -    datastore/\n' +
          'mAXASIF58POI3+TbHb69iXpD3dRqfXusEj1mHMwPCFenM6HWZ -    init-docs/\n' +
          'mAXASICiW5ai+KiU60glImEMMkiHaNSOAivpXspriIhJO8iHI 2    version\n'
        )
      })
  })
}))
