/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

// Note: There are more comprehensive tests in interface-js-ipfs-core
describe('refs', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
    return ipfs('add -r test/fixtures/test-data/recursive-get-dir')
  })

  it('prints added files', function () {
    this.timeout(20 * 1000)

    return ipfs('refs Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z')
      .then((out) => {
        expect(out).to.eql(
          'QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT\n' +
          'QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN\n' +
          'QmUqyZtPmsRy1U5Mo8kz2BAMmk1hfJ7yW1KAFTMB2odsFv\n' +
          'QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU\n' +
          'QmR56UJmAaZLXLdTT1ALrE9vVqV8soUEekm9BMd4FnuYqV\n'
        )
      })
  })

  it('follows a path with recursion, <hash>/<subdir>', function () {
    this.timeout(20 * 1000)

    return ipfs('refs -r --format="<linkname>" /ipfs/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z/init-docs')
      .then((out) => {
        expect(out).to.eql(
          'about\n' +
          'contact\n' +
          'docs\n' +
          'index\n' +
          'help\n' +
          'quick-start\n' +
          'readme\n' +
          'security-notes\n' +
          'tour\n' +
          '0.0-intro\n'
        )
      })
  })
}))
