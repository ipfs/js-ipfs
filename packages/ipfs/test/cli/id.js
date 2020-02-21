/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const YargsPromise = require('yargs-promise')
const clearModule = require('clear-module')

describe('id', () => {
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

  it('should output formatted json string', async () => {
    const fakeId = sinon.fake.returns(
      { id: 'id', publicKey: 'publicKey' }
    )

    sinon
      .stub(cliUtils, 'getIPFS')
      .returns(Promise.resolve({ id: fakeId }))

    // TODO: the lines below shouldn't be necessary, cli needs refactor to simplify testability
    // Force the next require to not use require cache
    clearModule('../../src/cli/commands/id.js')
    const { data } = await cli.parse('id')

    expect(data).to.eq('{\n  "id": "id",\n  "publicKey": "publicKey"\n}')
  })
})
