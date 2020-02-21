/* eslint-env mocha */
'use strict'

const expect = require('../helpers/chai')
const http = require('../helpers/http')
const sinon = require('sinon')

function defaultOptions (modification = {}) {
  const options = {
    recursive: false
  }

  Object.keys(modification).forEach(key => {
    options[key] = modification[key]
  })

  return options
}

describe('rm', () => {
  const path = '/foo'
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        rm: sinon.stub().resolves()
      }
    }
  })

  it('should remove a path', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/rm?arg=${path}`
    }, { ipfs })

    expect(ipfs.files.rm.callCount).to.equal(1)
    expect(ipfs.files.rm.getCall(0).args).to.deep.equal([
      path,
      defaultOptions()
    ])
  })

  it('should remove a path recursively', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/rm?arg=${path}&recursive=true`
    }, { ipfs })

    expect(ipfs.files.rm.callCount).to.equal(1)
    expect(ipfs.files.rm.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        recursive: true
      })
    ])
  })
})
