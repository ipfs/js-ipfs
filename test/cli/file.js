/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')
const file = 'QmR56UJmAaZLXLdTT1ALrE9vVqV8soUEekm9BMd4FnuYqV'
const dir = 'QmYmW4HiZhotsoSqnv2o1oUusvkRM8b9RweBoH7ao5nki2'

describe('file ls', () => runOnAndOff((thing) => {
  let ipfs

  before(function () {
    this.timeout(50 * 1000)
    ipfs = thing.ipfs
    return ipfs('files add -r test/fixtures/test-data/recursive-get-dir')
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
        'QmQQHYDwAQms78fPcvx1uFFsfho23YJNoewfLbi9AtdyJ9\n' +
        'QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN\n' +
        'Qma13ZrhKG52MWnwtZ6fMD8jGj8d4Q9sJgn5xtKgeZw5uz\n' +
        'QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU\n' +
        'QmR56UJmAaZLXLdTT1ALrE9vVqV8soUEekm9BMd4FnuYqV\n'
      ))
  })
}))
