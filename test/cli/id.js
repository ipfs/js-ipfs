/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const parser = require('../../src/cli/parser')
const YargsPromise = require('yargs-promise')

describe('id', () => {
  const cli = new YargsPromise(parser)

  it('get the id', () => {
    return cli.parse('id')
      .then(({ data }) => {
        const id = JSON.parse(data)
        expect(id).to.have.property('id')
        expect(id).to.have.property('publicKey')
        expect(id).to.have.property('addresses')
        return data
      })
  })
})
