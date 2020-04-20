/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const CID = require('cids')

describe('/resolve', () => {
  const cid = new CID('QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr')
  let ipfs

  beforeEach(() => {
    ipfs = {
      resolve: sinon.stub()
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod('/api/v0/resolve')
  })

  it('should not resolve a path for invalid cid-base option', async () => {
    const res = await http({
      method: 'POST',
      url: `/api/v0/resolve?arg=${cid}&cid-base=invalid`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 400)
    expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
  })
})
