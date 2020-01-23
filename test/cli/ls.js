/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const runOnAndOff = require('../utils/on-and-off')
const delay = require('delay')

describe('ls', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
    return ipfs('add -r test/fixtures/test-data/recursive-get-dir')
  })

  it('prints added files', async function () {
    this.timeout(20 * 1000)
    const out = await ipfs('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z')
    expect(out).to.eql(
      'drwxr-xr-x - QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT - blocks/\n' +
      '-rw-r--r-- - QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n' +
      'drwxr-xr-x - QmUqyZtPmsRy1U5Mo8kz2BAMmk1hfJ7yW1KAFTMB2odsFv -    datastore/\n' +
      'drwxr-xr-x - QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU -    init-docs/\n' +
      '-rw-r--r-- - QmR56UJmAaZLXLdTT1ALrE9vVqV8soUEekm9BMd4FnuYqV 2    version\n'
    )
  })

  it('supports a trailing slash', async function () {
    this.timeout(20 * 1000)
    const out = await ipfs('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z/')
    expect(out).to.eql(
      'drwxr-xr-x - QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT - blocks/\n' +
      '-rw-r--r-- - QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n' +
      'drwxr-xr-x - QmUqyZtPmsRy1U5Mo8kz2BAMmk1hfJ7yW1KAFTMB2odsFv -    datastore/\n' +
      'drwxr-xr-x - QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU -    init-docs/\n' +
      '-rw-r--r-- - QmR56UJmAaZLXLdTT1ALrE9vVqV8soUEekm9BMd4FnuYqV 2    version\n'
    )
  })

  it('supports multiple trailing slashes', async function () {
    this.timeout(20 * 1000)
    const out = await ipfs('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z///')
    expect(out).to.eql(
      'drwxr-xr-x - QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT - blocks/\n' +
      '-rw-r--r-- - QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n' +
      'drwxr-xr-x - QmUqyZtPmsRy1U5Mo8kz2BAMmk1hfJ7yW1KAFTMB2odsFv -    datastore/\n' +
      'drwxr-xr-x - QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU -    init-docs/\n' +
      '-rw-r--r-- - QmR56UJmAaZLXLdTT1ALrE9vVqV8soUEekm9BMd4FnuYqV 2    version\n'
    )
  })

  it('supports multiple intermediate slashes', async function () {
    this.timeout(20 * 1000)
    const out = await ipfs('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z///init-docs')
    expect(out).to.eql(
      '-rw-r--r-- - QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V 1677 about\n' +
      '-rw-r--r-- - QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y 189  contact\n' +
      'drwxr-xr-x - QmegvLXxpVKiZ4b57Xs1syfBVRd8CbucVHAp7KpLQdGieC -    docs/\n' +
      '-rw-r--r-- - QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7 311  help\n' +
      '-rw-r--r-- - QmdncfsVm2h5Kqq9hPmU7oAVX2zTSVP3L869tgTbPYnsha 1717 quick-start\n' +
      '-rw-r--r-- - QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB 1091 readme\n' +
      '-rw-r--r-- - QmTumTjvcYCAvRRwQ8sDRxh8ezmrcr88YFU7iYNroGGTBZ 1016 security-notes\n' +
      'drwxr-xr-x - QmciSU8hfpAXKjvK5YLUSwApomGSWN5gFbP4EpDAEzu2Te -    tour/\n'
    )
  })

  it('supports recursive listing through intermediate directories', async function () {
    this.timeout(20 * 1000)
    const out = await ipfs('ls -r Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z/blocks/CIQLB')
    expect(out).to.eql(
      '-rw-r--r-- - QmQ8ag7ysVyCMzJGFjxrUStwWtniQ69c7G9aezbmsKeNYD 10849 CIQLBK52T5EHVHZY5URTG5JS3JCUJDQM2DRB5RVF33DCUUOFJNGVDUI.data\n' +
      '-rw-r--r-- - QmaSjzSSRanYzRGPXQY6m5SWfSkkfcnzNkurJEQc4chPJx 10807 CIQLBS5HG4PRCRQ7O4EBXFD5QN6MTI5YBYMCVQJDXPKCOVR6RMLHZFQ.data\n'
    )
  })

  it('prints nothing for non-existant hashes', async function () {
    if (thing.on) {
      // If the daemon is on, ls should search until it hits a timeout
      await Promise.race([
        ipfs('ls QmYmW4HiZhotsoSqnv2o1oSssvkRM8b9RweBoH7ao5nki2'),
        delay(4000)
      ])
    } else {
      // If the daemon is off, ls should fail
      await ipfs.fail('ls QmYmW4HiZhotsoSqnv2o1oSssvkRM8b9RweBoH7ao5nki2')
    }
  })

  it('adds a header, -v', async function () {
    this.timeout(20 * 1000)
    const out = await ipfs('ls /ipfs/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z -v')
    expect(out).to.eql(
      'Mode       Mtime Hash                                           Size Name\n' +
      'drwxr-xr-x -     QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT -    blocks/\n' +
      '-rw-r--r-- -     QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n' +
      'drwxr-xr-x -     QmUqyZtPmsRy1U5Mo8kz2BAMmk1hfJ7yW1KAFTMB2odsFv -    datastore/\n' +
      'drwxr-xr-x -     QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU -    init-docs/\n' +
      '-rw-r--r-- -     QmR56UJmAaZLXLdTT1ALrE9vVqV8soUEekm9BMd4FnuYqV 2    version\n'
    )
  })

  it('follows a path, <hash>/<subdir>', async function () {
    this.timeout(20 * 1000)

    const out = await ipfs('ls /ipfs/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z/init-docs')
    expect(out).to.eql(
      '-rw-r--r-- - QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V 1677 about\n' +
      '-rw-r--r-- - QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y 189  contact\n' +
      'drwxr-xr-x - QmegvLXxpVKiZ4b57Xs1syfBVRd8CbucVHAp7KpLQdGieC -    docs/\n' +
      '-rw-r--r-- - QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7 311  help\n' +
      '-rw-r--r-- - QmdncfsVm2h5Kqq9hPmU7oAVX2zTSVP3L869tgTbPYnsha 1717 quick-start\n' +
      '-rw-r--r-- - QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB 1091 readme\n' +
      '-rw-r--r-- - QmTumTjvcYCAvRRwQ8sDRxh8ezmrcr88YFU7iYNroGGTBZ 1016 security-notes\n' +
      'drwxr-xr-x - QmciSU8hfpAXKjvK5YLUSwApomGSWN5gFbP4EpDAEzu2Te -    tour/\n'
    )
  })

  it('recursively follows folders, -r', async function () {
    this.slow(2000)
    this.timeout(20 * 1000)

    const out = await ipfs('ls -r /ipfs/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z/init-docs')
    expect(out).to.eql(
      '-rw-r--r-- - QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V 1677 about\n' +
      '-rw-r--r-- - QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y 189  contact\n' +
      'drwxr-xr-x - QmegvLXxpVKiZ4b57Xs1syfBVRd8CbucVHAp7KpLQdGieC -    docs/\n' +
      '-rw-r--r-- - QmQN88TEidd3RY2u3dpib49fERTDfKtDpvxnvczATNsfKT 6      index\n' +
      '-rw-r--r-- - QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7 311  help\n' +
      '-rw-r--r-- - QmdncfsVm2h5Kqq9hPmU7oAVX2zTSVP3L869tgTbPYnsha 1717 quick-start\n' +
      '-rw-r--r-- - QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB 1091 readme\n' +
      '-rw-r--r-- - QmTumTjvcYCAvRRwQ8sDRxh8ezmrcr88YFU7iYNroGGTBZ 1016 security-notes\n' +
      'drwxr-xr-x - QmciSU8hfpAXKjvK5YLUSwApomGSWN5gFbP4EpDAEzu2Te -    tour/\n' +
      '-rw-r--r-- - QmYE7xo6NxbHEVEHej1yzxijYaNY51BaeKxjXxn6Ssa6Bs 796    0.0-intro\n'
    )
  })

  it('should ls and print CIDs encoded in specified base', async function () {
    this.timeout(20 * 1000)

    const out = await ipfs('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z --cid-base=base64')
    expect(out).to.eql(
      'drwxr-xr-x - mAXASILidvV1YroHLqBvmuXko1Ly1UVenZV1K+MvhsjXhdvZQ - blocks/\n' +
      '-rw-r--r-- - mAXASIBT4ZYkQw0IApLoNHBxSjpezyayKZHJyxmFKpt0I3sK5 3928 config\n' +
      'drwxr-xr-x - mAXASIGCpScP8zpa0CqUgyVCR/Cm0Co8pnULGe3seXSsOnJsJ -    datastore/\n' +
      'drwxr-xr-x - mAXASIF58POI3+TbHb69iXpD3dRqfXusEj1mHMwPCFenM6HWZ -    init-docs/\n' +
      '-rw-r--r-- - mAXASICiW5ai+KiU60glImEMMkiHaNSOAivpXspriIhJO8iHI 2    version\n'
    )
  })
}))
