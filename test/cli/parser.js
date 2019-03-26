/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const parser = require('../../src/cli/parser')
const YargsPromise = require('yargs-promise')

describe('yargs cli parser', () => {
  let cli

  before(() => {
    cli = new YargsPromise(parser)
  })

  it('should handle --silent flag correctly', (done) => {
    cli
      .parse('serve --silent src/init-files/init-docs/readme')
      .then(({ error, argv }) => {
        expect(error).to.not.exist()
        expect(argv).to.include({ silent: true, pass: '' })
        expect(argv.getIpfs.instance).to.exist()
        done()
      })
      .catch(({ error }) => {
        done(error)
      })
  })

  it('should handle --pass flag correctly', (done) => {
    cli
      .parse('serve --pass password')
      .then(({ error, argv }) => {
        expect(error).to.not.exist()
        expect(argv).to.include({ silent: true, pass: '' })
        expect(argv.getIpfs.instance).to.exist()
        done()
      })
      .catch(({ error }) => {
        done(error)
      })
  })
})
