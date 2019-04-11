/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const fs = require('fs')
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const path = require('path')

module.exports = (http) => {
  describe('/config', () => {
    const configPath = path.join(__dirname, '../../repo-tests-run/config')
    const originalConfigPath = path.join(__dirname, '../../fixtures/go-ipfs-repo/config')

    let updatedConfig
    let api

    before(() => {
      updatedConfig = () => JSON.parse(fs.readFileSync(configPath, 'utf8'))
      api = http.api._httpApi._apiServers[0]
    })

    after(() => {
      fs.writeFileSync(configPath, fs.readFileSync(originalConfigPath, 'utf8'), 'utf8')
    })

    describe('/config', () => {
      it('returns 400 for request without arguments', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/config'
        })

        expect(res.statusCode).to.equal(400)
      })

      it('404 for request with missing args', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=kitten'
        })

        expect(res.statusCode).to.equal(404)
        expect(res.result.Code).to.equal(3)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns value for request with valid arg', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=API.HTTPHeaders'
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Key).to.equal('API.HTTPHeaders')
        expect(res.result.Value).to.equal(null)
      })

      it('returns value for request as subcommand', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/config/API.HTTPHeaders'
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Key).to.equal('API.HTTPHeaders')
        expect(res.result.Value).to.equal(null)
      })

      it('updates value for request with both args', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=Datastore.Path&arg=kitten'
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Key).to.equal('Datastore.Path')
        expect(res.result.Value).to.equal('kitten')
        expect(updatedConfig().Datastore.Path).to.equal('kitten')
      })

      it('returns 400 value for request with both args and JSON flag with invalid JSON argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=Datastore.Path&arg=kitten&json'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.equal(1)
        expect(res.result.Message).to.be.a('string')
      })

      it('updates value for request with both args and JSON flag with valid JSON argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=Datastore.Path&arg={"kitten": true}&json'
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Key).to.equal('Datastore.Path')
        expect(res.result.Value).to.deep.equal({ kitten: true })
        expect(updatedConfig().Datastore.Path).to.deep.equal({ kitten: true })
      })

      it('updates value for request with both args and bool flag and true argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=Datastore.Path&arg=true&bool'
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Key).to.equal('Datastore.Path')
        expect(res.result.Value).to.deep.equal(true)
        expect(updatedConfig().Datastore.Path).to.deep.equal(true)
      })

      it('updates value for request with both args and bool flag and false argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=Datastore.Path&arg=false&bool'
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Key).to.equal('Datastore.Path')
        expect(res.result.Value).to.deep.equal(false)
        expect(updatedConfig().Datastore.Path).to.deep.equal(false)
      })
    })

    it('/config/show', async () => {
      const res = await api.inject({
        method: 'POST',
        url: '/api/v0/config/show'
      })

      expect(res.statusCode).to.equal(200)
      expect(res.result).to.deep.equal(updatedConfig())
    })

    describe('/config/replace', () => {
      it('returns 400 if no config is provided', async () => {
        const form = new FormData()
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/config/replace',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(400)
      })

      it('returns 500 if the config is invalid', async () => {
        const form = new FormData()
        const filePath = 'test/fixtures/test-data/badconfig'
        form.append('file', fs.createReadStream(filePath))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/config/replace',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(500)
      })

      it('updates value', async () => {
        const form = new FormData()
        const filePath = 'test/fixtures/test-data/otherconfig'
        form.append('file', fs.createReadStream(filePath))
        const headers = form.getHeaders()
        const expectedConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/config/replace',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        expect(updatedConfig()).to.deep.equal(expectedConfig)
      })
    })
  })
}
