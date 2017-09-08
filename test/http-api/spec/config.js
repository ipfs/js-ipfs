/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const fs = require('fs')
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const path = require('path')

const setup = require('../index')

const configPath = path.join(__dirname, '../../repo-tests-run/config')
const originalConfigPath = path.join(__dirname, '../../go-ipfs-repo/config')

describe('/config', () => {
  let updatedConfig
  let api
  let http

  before((done) => {
    updatedConfig = () => JSON.parse(fs.readFileSync(configPath, 'utf8'))

    setup.before((err, _http) => {
      if (err) {
        return done(err)
      }

      http = _http
      api = http.api.server.select('API')
      done()
    })
  })

  after((done) => {
    fs.writeFileSync(configPath, fs.readFileSync(originalConfigPath, 'utf8'), 'utf8')
    setup.after(http, done)
  })

  it('returns 400 for request without arguments', () => {
    return api.inject({
      method: 'POST',
      url: '/api/v0/config'
    }).then((res) => {
      expect(res.statusCode).to.equal(400)
    })
  })

  it('500 for request with invalid args', () => {
    return api.inject({
      method: 'POST',
      url: '/api/v0/config?arg=kitten'
    }).then((res) => {
      expect(res.statusCode).to.equal(500)
      expect(res.result.Code).to.equal(0)
      expect(res.result.Message).to.be.a('string')
    })
  })

  it('returns value for request with valid arg', () => {
    return api.inject({
      method: 'POST',
      url: '/api/v0/config?arg=API.HTTPHeaders'
    }).then((res) => {
      expect(res.statusCode).to.equal(200)
      expect(res.result.Key).to.equal('API.HTTPHeaders')
      expect(res.result.Value).to.equal(null)
    })
  })

  it('returns value for request as subcommand', () => {
    return api.inject({
      method: 'POST',
      url: '/api/v0/config/API.HTTPHeaders'
    }).then((res) => {
      expect(res.statusCode).to.equal(200)
      expect(res.result.Key).to.equal('API.HTTPHeaders')
      expect(res.result.Value).to.equal(null)
    })
  })

  it('updates value for request with both args', () => {
    return api.inject({
      method: 'POST',
      url: '/api/v0/config?arg=Datastore.Path&arg=kitten'
    }).then((res) => {
      expect(res.statusCode).to.equal(200)
      expect(res.result.Key).to.equal('Datastore.Path')
      expect(res.result.Value).to.equal('kitten')
      expect(updatedConfig().Datastore.Path).to.equal('kitten')
    })
  })

  it('returns 500 value for request with both args and JSON flag with invalid JSON argument', () => {
    return api.inject({
      method: 'POST',
      url: '/api/v0/config?arg=Datastore.Path&arg=kitten&json'
    }).then((res) => {
      expect(res.statusCode).to.equal(500)
      expect(res.result.Code).to.equal(0)
      expect(res.result.Message).to.be.a('string')
    })
  })

  it('updates value for request with both args and JSON flag with valid JSON argument', () => {
    return api.inject({
      method: 'POST',
      url: '/api/v0/config?arg=Datastore.Path&arg={"kitten": true}&json'
    }).then((res) => {
      expect(res.statusCode).to.equal(200)
      expect(res.result.Key).to.equal('Datastore.Path')
      expect(res.result.Value).to.deep.equal({ kitten: true })
      expect(updatedConfig().Datastore.Path).to.deep.equal({ kitten: true })
    })
  })

  it('updates value for request with both args and bool flag and true argument', () => {
    return api.inject({
      method: 'POST',
      url: '/api/v0/config?arg=Datastore.Path&arg=true&bool'
    }).then((res) => {
      expect(res.statusCode).to.equal(200)
      expect(res.result.Key).to.equal('Datastore.Path')
      expect(res.result.Value).to.deep.equal(true)
      expect(updatedConfig().Datastore.Path).to.deep.equal(true)
    })
  })

  it('updates value for request with both args and bool flag and false argument', () => {
    return api.inject({
      method: 'POST',
      url: '/api/v0/config?arg=Datastore.Path&arg=false&bool'
    }).then((res) => {
      expect(res.statusCode).to.equal(200)
      expect(res.result.Key).to.equal('Datastore.Path')
      expect(res.result.Value).to.deep.equal(false)
      expect(updatedConfig().Datastore.Path).to.deep.equal(false)
    })
  })

  it('/config/show', () => {
    return api.inject({
      method: 'POST',
      url: '/api/v0/config/show'
    }).then((res) => {
      expect(res.statusCode).to.equal(200)
      expect(res.result).to.deep.equal(updatedConfig())
    })
  })

  describe.skip('/config/replace', () => {
    it('returns 400 if no config is provided', () => {
      const form = new FormData()
      const headers = form.getHeaders()

      return streamToPromise(form).then((payload) => {
        return api.inject({
          method: 'POST',
          url: '/api/v0/config/replace',
          headers: headers,
          payload: payload
        })
      }).then((res) => {
        expect(res.statusCode).to.equal(400)
      })
    })

    it('returns 500 if the config is invalid', () => {
      const form = new FormData()
      const filePath = 'test/test-data/badconfig'
      form.append('file', fs.createReadStream(filePath))
      const headers = form.getHeaders()

      return streamToPromise(form).then((payload) => {
        return api.inject({
          method: 'POST',
          url: '/api/v0/config/replace',
          headers: headers,
          payload: payload
        })
      }).then((res) => {
        expect(res.statusCode).to.equal(500)
      })
    })

    it('updates value', () => {
      const form = new FormData()
      const filePath = 'test/test-data/otherconfig'
      form.append('file', fs.createReadStream(filePath))
      const headers = form.getHeaders()
      const expectedConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'))

      return streamToPromise(form).then((payload) => {
        return api.inject({
          method: 'POST',
          url: '/api/v0/config/replace',
          headers: headers,
          payload: payload
        })
      }).then((res) => {
        expect(res.statusCode).to.equal(200)
        expect(updatedConfig()).to.deep.equal(expectedConfig)
      })
    })
  })
})
