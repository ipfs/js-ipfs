/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const YargsPromise = require('yargs-promise')
const clearModule = require('clear-module')

describe('name', () => {
  let cli
  let cliUtils
  beforeEach(() => {
    cliUtils = require('../../src/cli/utils')
    cli = new YargsPromise(require('../../src/cli/parser'))
  })
  afterEach(() => {
    sinon.restore()
    // TODO: the lines below shouldn't be necessary, cli needs refactor to simplify testability
    // Force the next require to not use require cache
    clearModule('../../src/cli/utils')
    clearModule('../../src/cli/parser')
  })

  it('resolve', async () => {
    // eslint-disable-next-line require-await
    const resolveFake = sinon.fake.returns((async function * () { yield '/ipfs/QmTest' })())

    sinon
      .stub(cliUtils, 'getIPFS')
      .returns(Promise.resolve({ name: { resolve: resolveFake } }))

    // TODO: the lines below shouldn't be necessary, cli needs refactor to simplify testability
    // Force the next require to not use require cache
    clearModule('../../src/cli/commands/name/resolve.js')

    await cli.parse('name resolve test')
    sinon.assert.calledWith(resolveFake, 'test', { nocache: false, recursive: true })
  })

  it('publish', async () => {
    const publishFake = sinon.fake.returns({ name: 'name', value: 'value' })
    const printSpy = sinon.spy(cliUtils, 'print')

    sinon
      .stub(cliUtils, 'getIPFS')
      .returns(Promise.resolve({ name: { publish: publishFake } }))

    // TODO: the lines below shouldn't be necessary, cli needs refactor to simplify testability
    // Force the next require to not use require cache
    clearModule('../../src/cli/commands/name/publish.js')

    await cli.parse('name publish test --silent')
    sinon.assert.calledWith(printSpy, 'Published to name: value')
    sinon.assert.calledWith(publishFake, 'test', {
      resolve: true,
      lifetime: '24h',
      key: 'self',
      ttl: ''
    })
  })
})
