/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const cli = require('../../src/cli/parser')

describe('name', () => {
  it('resolve', (done) => {
    const resolveFake = sinon.fake.resolves('result')
    const printFake = sinon.fake()
    cli
      .onFinishCommand(() => {
        sinon.assert.calledWith(printFake, 'result')
        sinon.assert.calledWith(resolveFake, 'test', { nocache: false, recursive: true })
        done()
      })
      .parse('name resolve test', { print: printFake, ipfs: { api: { name: { resolve: resolveFake } } } })
  })

  it('publish', (done) => {
    const publishFake = sinon.fake.returns({ name: 'name', value: 'value' })
    const printFake = sinon.fake()

    cli
      .onFinishCommand(() => {
        sinon.assert.calledWith(printFake, 'Published to name: value')
        sinon.assert.calledWith(publishFake, 'test', sinon.match({
          resolve: true,
          lifetime: '24h',
          key: 'self',
          ttl: ''
        }))
        done()
      })
      .parse('name publish test --silent', { print: printFake, ipfs: { api: { name: { publish: publishFake } } } })
  })
})
