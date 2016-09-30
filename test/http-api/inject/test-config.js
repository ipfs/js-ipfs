/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const fs = require('fs')
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const path = require('path')

module.exports = (http) => {
  describe('/config', () => {
    const configPath = path.join(__dirname, '../../repo-tests-async/http/config')
    const originalConfigPath = path.join(__dirname, '../../go-ipfs-repo/config')

    let updatedConfig
    let api

    before(() => {
      updatedConfig = () => JSON.parse(fs.readFileSync(configPath, 'utf8'))

      api = http.api.server.select('API')
    })

    after(() => {
      fs.writeFileSync(configPath, fs.readFileSync(originalConfigPath, 'utf8'), 'utf8')
    })

    describe('400 for request with no args', () => {
      it('returns 400 for request without arguments', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/config'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          done()
        })
      })

      it('500 for request with invalid args', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=kitten'
        }, (res) => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Code).to.equal(0)
          expect(res.result.Message).to.be.a('string')
          done()
        })
      })

      it('returns value for request with valid arg', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=API.HTTPHeaders'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Key).to.equal('API.HTTPHeaders')
          expect(res.result.Value).to.equal(null)
          done()
        })
      })

      it('returns value for request as subcommand', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/config/API.HTTPHeaders'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Key).to.equal('API.HTTPHeaders')
          expect(res.result.Value).to.equal(null)
          done()
        })
      })

      it('updates value for request with both args', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=Datastore.Path&arg=kitten'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Key).to.equal('Datastore.Path')
          expect(res.result.Value).to.equal('kitten')
          expect(updatedConfig().Datastore.Path).to.equal('kitten')

          done()
        })
      })

      it('returns 500 value for request with both args and JSON flag with invalid JSON argument', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=Datastore.Path&arg=kitten&json'
        }, (res) => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Code).to.equal(0)
          expect(res.result.Message).to.be.a('string')

          done()
        })
      })

      it('updates value for request with both args and JSON flag with valid JSON argument', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=Datastore.Path&arg={"kitten": true}&json'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Key).to.equal('Datastore.Path')
          expect(res.result.Value).to.deep.equal({ kitten: true })
          expect(updatedConfig().Datastore.Path).to.deep.equal({ kitten: true })

          done()
        })
      })

      it('updates value for request with both args and bool flag and true argument', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=Datastore.Path&arg=true&bool'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Key).to.equal('Datastore.Path')
          expect(res.result.Value).to.deep.equal(true)
          expect(updatedConfig().Datastore.Path).to.deep.equal(true)

          done()
        })
      })

      it('updates value for request with both args and bool flag and false argument', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=Datastore.Path&arg=false&bool'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Key).to.equal('Datastore.Path')
          expect(res.result.Value).to.deep.equal(false)
          expect(updatedConfig().Datastore.Path).to.deep.equal(false)

          done()
        })
      })
    })

    it('/config/show', (done) => {
      api.inject({
        method: 'POST',
        url: '/api/v0/config/show'
      }, (res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.deep.equal(updatedConfig())
        done()
      })
    })

    describe('/config/replace', () => {
      it('returns 400 if no config is provided', (done) => {
        const form = new FormData()
        const headers = form.getHeaders()

        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/config/replace',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            done()
          })
        })
      })

      it('returns 500 if the config is invalid', (done) => {
        const form = new FormData()
        const filePath = 'test/test-data/badconfig'
        form.append('file', fs.createReadStream(filePath))
        const headers = form.getHeaders()

        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/config/replace',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(500)
            done()
          })
        })
      })

      it('updates value', (done) => {
        const form = new FormData()
        const filePath = 'test/test-data/otherconfig'
        form.append('file', fs.createReadStream(filePath))
        const headers = form.getHeaders()
        const expectedConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/config/replace',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(updatedConfig()).to.deep.equal(expectedConfig)
            done()
          })
        })
      })
    })
  })
}
