/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const CID = require('cids')
const cli = require('../../src/cli/parser')

describe('gc', () => {
  it('gc with no flags prints errors and outputs hashes', (done) => {
    const methodFake = sinon.fake.resolves([
      { cid: new CID('Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u') },
      { cid: new CID('QmVc6zuAneKJzicnJpfrqCH9gSy6bz54JhcypfJYhGUFQu') },
      { err: new Error('some err') }
    ])
    const printFake = sinon.fake()
    cli
      .onFinishCommand(() => {
        sinon.assert.calledWith(printFake.getCall(0), 'removed Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u')
        sinon.assert.calledWith(printFake.getCall(1), 'removed QmVc6zuAneKJzicnJpfrqCH9gSy6bz54JhcypfJYhGUFQu')
        sinon.assert.calledWith(printFake.getCall(2), 'some err')
        sinon.assert.called(methodFake)
        done()
      })
      .parse('repo gc', {
        print: printFake,
        ipfs: { api: { repo: { gc: methodFake } } }
      })
  })

  it('gc with --quiet prints hashes only', (done) => {
    const methodFake = sinon.fake.resolves([
      { cid: new CID('Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u') },
      { cid: new CID('QmVc6zuAneKJzicnJpfrqCH9gSy6bz54JhcypfJYhGUFQu') },
      { err: new Error('some err') }
    ])
    const printFake = sinon.fake()
    cli
      .onFinishCommand(() => {
        sinon.assert.calledWith(printFake.getCall(0), 'Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u')
        sinon.assert.calledWith(printFake.getCall(1), 'QmVc6zuAneKJzicnJpfrqCH9gSy6bz54JhcypfJYhGUFQu')
        sinon.assert.calledWith(printFake.getCall(2), 'some err')
        sinon.assert.called(methodFake)
        done()
      })
      .parse('repo gc --quiet', {
        print: printFake,
        ipfs: { api: { repo: { gc: methodFake } } }
      })
  })

  it('gc with --stream-errors=false does not print errors', (done) => {
    const methodFake = sinon.fake.resolves([
      { cid: new CID('QmVc6zuAneKJzicnJpfrqCH9gSy6bz54JhcypfJYhGUFQu') },
      { err: new Error('some err') }
    ])
    const printFake = sinon.fake()
    cli
      .onFinishCommand(() => {
        sinon.assert.calledOnce(printFake)
        sinon.assert.calledWith(printFake, 'removed QmVc6zuAneKJzicnJpfrqCH9gSy6bz54JhcypfJYhGUFQu')
        sinon.assert.called(methodFake)
        done()
      })
      .parse('repo gc --stream-errors=false', {
        print: printFake,
        ipfs: { api: { repo: { gc: methodFake } } }
      })
  })
})
