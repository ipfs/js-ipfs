/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')
const file = 'QmR56UJmAaZLXLdTT1ALrE9vVqV8soUEekm9BMd4FnuYqV'
const dir = 'Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z'

describe('file ls', () => runOnAndOff((thing) => {
  let ipfs

  before(function () {
    this.timeout(50 * 1000)
    ipfs = thing.ipfs
    return ipfs('add -r test/fixtures/test-data/recursive-get-dir')
  })

  it('prints a filename', () => {
    return ipfs(`file ls ${file}`)
      .then((out) => expect(out).to.eql(
        `This functionality is deprecated, and will be removed in future versions. If possible, please use 'ipfs ls' instead.\n` +
        `${file}\n`
      ))
  })

  it('prints the filenames in a directory', () => {
    return ipfs(`file ls ${dir}`)
      .then((out) => expect(out).to.eql(
        `This functionality is deprecated, and will be removed in future versions. If possible, please use 'ipfs ls' instead.\n` +
        'QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT\n' +
        'QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN\n' +
        'QmUqyZtPmsRy1U5Mo8kz2BAMmk1hfJ7yW1KAFTMB2odsFv\n' +
        'QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU\n' +
        'QmR56UJmAaZLXLdTT1ALrE9vVqV8soUEekm9BMd4FnuYqV\n'
      ))
  })
}))
