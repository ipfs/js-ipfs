/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')

describe('/key', function () {
  let ipfs

  beforeEach(() => {
    ipfs = {
      key: {
        list: sinon.stub(),
        rm: sinon.stub(),
        rename: sinon.stub(),
        gen: sinon.stub(),
        export: sinon.stub(),
        import: sinon.stub()
      }
    }
  })

  describe('/list', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/key/list')
    })

    it('should list keys', async () => {
      ipfs.key.list.returns([{
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
  })

  describe('/gen', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/key/gen')
    })

    it('should generate a key', async () => {
      const name = 'name'
      const type = 'type'
      const size = 10

      ipfs.key.gen.withArgs(name, sinon.match({
        type,
        size
      })).returns({
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
  })

  describe('/rm', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/key/rm')
    })

    it('should remove a key', async () => {
      const name = 'name'

      ipfs.key.rm.withArgs(name).returns({
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
  })

  describe('/rename', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/key/rename')
    })

    it('should rename a key', async () => {
      const oldName = 'oldName'
      const newName = 'newName'

      ipfs.key.rename.withArgs(oldName, newName).returns({
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
  })

  describe('/export', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/key/export')
    })

    it('should export a key', async () => {
      const name = 'name'
      const password = 'password'

      ipfs.key.export.withArgs(name, password).returns('pem')

      const res = await http({
        method: 'POST',
        url: `/api/v0/key/export?arg=${name}&password=${password}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.property('result', 'pem')
    })
  })

  describe('/import', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/key/import')
    })

    it('should import a key', async () => {
      const name = 'name'
      const pem = 'pem'
      const password = 'password'

      ipfs.key.import.withArgs(name, pem, password).returns({
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
  })
})
