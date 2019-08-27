/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const YargsPromise = require('yargs-promise')
const CID = require('cids')
const cliUtils = require('../../src/cli/utils')
const cli = new YargsPromise(require('../../src/cli/parser'))

describe('gc', () => {
  const setupMocks = (cids, errMsg) => {
    let gcRes = cids.map(h => ({ cid: new CID(h) }))
    if (errMsg) {
      gcRes = gcRes.concat([{ err: new Error(errMsg) }])
    }

    const gcFake = sinon.fake.returns(gcRes)
    sinon
      .stub(cliUtils, 'getIPFS')
      .callsArgWith(1, null, { repo: { gc: gcFake } })

    return sinon.stub(cliUtils, 'print')
  }

  afterEach(() => {
    sinon.restore()
  })

  it('gc with no flags prints errors and outputs hashes', async () => {
    const cids = [
      'Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u',
      'QmVc6zuAneKJzicnJpfrqCH9gSy6bz54JhcypfJYhGUFQu'
    ]
    const errMsg = 'some err'
    const printSpy = setupMocks(cids, errMsg)

    await cli.parse(`repo gc`)

    const exp = cids.map(c => 'removed ' + c).concat(errMsg)
    for (let i = 0; i < exp.length; i++) {
      sinon.assert.calledWith(printSpy.getCall(i), exp[i])
    }
  })

  it('gc with --quiet prints hashes only', async () => {
    const cids = [
      'Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u',
      'QmVc6zuAneKJzicnJpfrqCH9gSy6bz54JhcypfJYhGUFQu'
    ]
    const printSpy = setupMocks(cids)

    await cli.parse(`repo gc --quiet`)

    const exp = cids.map(c => c.toString())
    for (let i = 0; i < exp.length; i++) {
      sinon.assert.calledWith(printSpy.getCall(i), exp[i])
    }
  })

  it('gc with --stream-errors=false does not print errors', async () => {
    const printSpy = setupMocks([], 'some err')

    await cli.parse(`repo gc --stream-errors=false`)
    sinon.assert.notCalled(printSpy)
  })
})
