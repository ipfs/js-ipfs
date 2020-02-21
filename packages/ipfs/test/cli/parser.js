/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const parser = require('../../src/cli/parser')
const YargsPromise = require('yargs-promise')

describe('yargs cli parser', () => {
  let cli

  before(() => {
    cli = new YargsPromise(parser)
  })

  it('should handle --silent flag correctly', async () => {
    const { error, argv } = await cli.parse('serve --silent src/init-files/init-docs/readme')
    expect(error).to.not.exist()
    expect(argv).to.include({ silent: true, pass: '' })
  })

  it('should handle --pass flag correctly', async () => {
    const { error, argv } = await cli.parse('serve --pass password')
    expect(error).to.not.exist()
    expect(argv).to.include({ silent: false, pass: 'password' })
  })
})
