/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const parser = require('../../src/cli/bin').parser

describe('yargs cli parser', () => {
  it('should handle --silent flag correctly', () => {
    parser.parse('serve --silent src/init-files/init-docs/readme', (err, argv) => {
      expect(err).to.not.exist()
      expect(argv).to.include({ silent: true, pass: '' })
    })
  })

  it('should handle --pass flag correctly', () => {
    parser.parse('serve --pass password', (err, argv) => {
      expect(err).to.not.exist()
      expect(argv).to.include({ silent: false, pass: 'password' })
    })
  })
})
