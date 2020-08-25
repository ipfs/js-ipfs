/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const { AbortSignal } = require('abort-controller')

describe('/key', function () {
  let ipfs

  beforeEach(() => {
    ipfs = {
      key: {
        list: sinon.stub(),
        rm: sinon.stub(),
        rename: sinon.stub(),
        gen: sinon.stub(),
        import: sinon.stub()
      }
    }
  })

  describe('/list', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/key/list')
    })

    it('should list keys', async () => {
      ipfs.key.list.withArgs(defaultOptions).returns([{
        name: 'name',
        id: 'id'
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/key/list'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Keys[0].Name', 'name')
      expect(res).to.have.nested.property('result.Keys[0].Id', 'id')
    })

    it('accepts a timeout', async () => {
      ipfs.key.list.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        name: 'name',
        id: 'id'
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/key/list?timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })
  })

  describe('/gen', () => {
    const defaultOptions = {
      type: 'rsa',
      size: 2048,
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/key/gen')
    })

    it('should generate a key', async () => {
      const name = 'name'
      const type = 'type'
      const size = 10

      ipfs.key.gen.withArgs(name, {
        ...defaultOptions,
        type,
        size
      }).returns({
        name: 'name',
        id: 'id'
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/key/gen?arg=${name}&type=${type}&size=${size}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Name', name)
      expect(res).to.have.nested.property('result.Id', 'id')
    })

    it('accepts a timeout', async () => {
      const name = 'name'

      ipfs.key.gen.withArgs(name, {
        ...defaultOptions,
        timeout: 1000
      }).returns({
        name: 'name',
        id: 'id'
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/key/gen?arg=${name}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })
  })

  describe('/rm', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/key/rm')
    })

    it('should remove a key', async () => {
      const name = 'name'

      ipfs.key.rm.withArgs(name, defaultOptions).returns({
        name: 'name',
        id: 'id'
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/key/rm?arg=${name}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Keys[0].Name', 'name')
      expect(res).to.have.nested.property('result.Keys[0].Id', 'id')
    })

    it('accepts a timeout', async () => {
      const name = 'name'

      ipfs.key.rm.withArgs(name, {
        ...defaultOptions,
        timeout: 1000
      }).returns({
        name: 'name',
        id: 'id'
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/key/rm?arg=${name}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })
  })

  describe('/rename', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/key/rename')
    })

    it('should rename a key', async () => {
      const oldName = 'oldName'
      const newName = 'newName'

      ipfs.key.rename.withArgs(oldName, newName, defaultOptions).returns({
        was: oldName,
        now: newName,
        id: 'id',
        overwrite: 'overwrite'
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/key/rename?arg=${oldName}&arg=${newName}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Was', oldName)
      expect(res).to.have.nested.property('result.Now', newName)
      expect(res).to.have.nested.property('result.Id', 'id')
      expect(res).to.have.nested.property('result.Overwrite', 'overwrite')
    })

    it('accepts a timeout', async () => {
      const oldName = 'oldName'
      const newName = 'newName'

      ipfs.key.rename.withArgs(oldName, newName, {
        ...defaultOptions,
        timeout: 1000
      }).returns({
        was: oldName,
        now: newName,
        id: 'id',
        overwrite: 'overwrite'
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/key/rename?arg=${oldName}&arg=${newName}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })
  })

  describe('/import', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/key/import')
    })

    it('should import a key', async () => {
      const name = 'name'
      const pem = 'pem'
      const password = 'password'

      ipfs.key.import.withArgs(name, pem, password, defaultOptions).returns({
        name,
        id: 'id'
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/key/import?arg=${name}&pem=${pem}&password=${password}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Name', name)
      expect(res).to.have.nested.property('result.Id', 'id')
    })

    it('accepts a timeout', async () => {
      const name = 'name'
      const pem = 'pem'
      const password = 'password'

      ipfs.key.import.withArgs(name, pem, password, {
        ...defaultOptions,
        timeout: 1000
      }).returns({
        name,
        id: 'id'
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/key/import?arg=${name}&pem=${pem}&password=${password}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Name', name)
      expect(res).to.have.nested.property('result.Id', 'id')
    })
  })
})
