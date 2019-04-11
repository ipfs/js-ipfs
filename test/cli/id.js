/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const parser = require('../../src/cli/parser')
const YargsPromise = require('yargs-promise')
const runOnAndOff = require('../utils/on-and-off')

describe('id', () => runOnAndOff((thing) => {
  let ipfs

  before(function () {
    this.timeout(60 * 1000)
    ipfs = thing.ipfs
  })

  it('get the id', function () {
    this.timeout(60 * 1000)

    return ipfs('id').then((res) => {
      const id = JSON.parse(res)
      expect(id).to.have.property('id')
      expect(id).to.have.property('publicKey')
      expect(id).to.have.property('addresses')
    })
  })
}))

describe('id', () => {
  const cli = new YargsPromise(parser)

  it('get the id with cli parser', () => {
    return cli.parse('id --silent')
      .then(({ data }) => {
        const id = JSON.parse(data)
        expect(id).to.have.property('id')
        expect(id).to.have.property('publicKey')
        expect(id).to.have.property('addresses')
        return data
      })
  })
})
