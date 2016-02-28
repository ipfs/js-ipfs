/* eslint-env mocha */

const expect = require('chai').expect
const fs = require('fs')
const APIctl = require('ipfs-api')

describe('config', () => {
  const configPath = process.cwd() + '/tests/repo-tests-run/config'
  const updatedConfig = () => JSON.parse(fs.readFileSync(configPath, 'utf8'))

  describe('api', () => {
    var api

    before('api', (done) => {
      api = require('../../src/http-api').server.select('API')
      done()
    })

    describe('/config', () => {
      it('returns 400 for request without arguments', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/config'
        }, res => {
          expect(res.statusCode).to.equal(400)
          done()
        })
      })

      it('returns 500 for request with invalid argument', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=kitten'
        }, res => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Code).to.equal(0)
          expect(res.result.Message).to.be.a('string')
          done()
        })
      })

      it('returns value for request with argument', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=API.HTTPHeaders'
        }, res => {
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
        }, res => {
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
        }, res => {
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
        }, res => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Code).to.equal(0)
          expect(res.result.Message).to.be.a('string')

          done()
        })
      })

      it('updates value for request with both args and JSON flag with valid JSON argument', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/config?arg=Datastore.Path&arg={\"kitten\": true}&json'
        }, res => {
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
        }, res => {
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
        }, res => {
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
      }, res => {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.deep.equal(updatedConfig())
        done()
      })
    })
  })

  describe('using js-ipfs-api', () => {
    var ctl

    before('start IPFS API ctl', (done) => {
      ctl = APIctl('/ip4/127.0.0.1/tcp/6001')
      done()
    })

    describe('ipfs.config', () => {
      it('returns error for request without arguments', (done) => {
        ctl.config.get(null, (err, res) => {
          expect(err).to.exist

          done()
        })
      })

      it('returns error for request with invalid argument', (done) => {
        ctl.config.get('kittens', (err, res) => {
          expect(err).to.exist

          done()
        })
      })

      it('returns value for request with argument', (done) => {
        ctl.config.get('API.HTTPHeaders', (err, res) => {
          expect(err).not.to.exist
          expect(res.Key).to.equal('API.HTTPHeaders')
          expect(res.Value).to.equal(null)

          done()
        })
      })

      it('updates value for request with both args', (done) => {
        ctl.config.set('Datastore.Path', 'kitten', (err, res) => {
          expect(err).not.to.exist
          expect(res.Key).to.equal('Datastore.Path')
          expect(res.Value).to.equal('kitten')
          expect(updatedConfig().Datastore.Path).to.equal('kitten')

          done()
        })
      })

      it('returns error for request with both args and JSON flag with invalid JSON argument', (done) => {
        ctl.config.set('Datastore.Path', 'kitten', { json: true }, (err, res) => {
          expect(err).to.exist

          done()
        })
      })

      it('updates value for request with both args and JSON flag with valid JSON argument', (done) => {
        ctl.config.set('Datastore.Path', JSON.stringify({ kitten: true }), { json: true }, (err, res) => {
          expect(err).not.to.exist
          expect(res.Key).to.equal('Datastore.Path')
          expect(res.Value).to.deep.equal({ kitten: true })
          expect(updatedConfig().Datastore.Path).to.deep.equal({ kitten: true })

          done()
        })
      })

      it('updates value for request with both args and bool flag and true argument', (done) => {
        ctl.config.set('Datastore.Path', true, { bool: true }, (err, res) => {
          expect(err).not.to.exist
          expect(res.Key).to.equal('Datastore.Path')
          expect(res.Value).to.deep.equal(true)
          expect(updatedConfig().Datastore.Path).to.deep.equal(true)

          done()
        })
      })

      it('updates value for request with both args and bool flag and false argument', (done) => {
        ctl.config.set('Datastore.Path', false, { bool: true }, (err, res) => {
          expect(err).not.to.exist
          expect(res.Key).to.equal('Datastore.Path')
          expect(res.Value).to.deep.equal(false)
          expect(updatedConfig().Datastore.Path).to.deep.equal(false)

          done()
        })
      })
    })

    it('ipfs.config.show', (done) => {
      ctl.config.show((err, res) => {
        expect(err).not.to.exist
        expect(res).to.deep.equal(updatedConfig())
        done()
      })
    })
  })
})
