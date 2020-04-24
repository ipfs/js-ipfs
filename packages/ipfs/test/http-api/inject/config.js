/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const fs = require('fs')
const { Buffer } = require('buffer')
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const { profiles } = require('../../../src/core/components/config')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')

describe('/config', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      config: {
        get: sinon.stub(),
        replace: sinon.stub(),
        profiles: {
          apply: sinon.stub(),
          list: sinon.stub()
        }
      }
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod('/api/v0/config')
  })

  it('returns 400 for request without arguments', async () => {
    const res = await http({
      method: 'POST',
      url: '/api/v0/config'
    }, { ipfs })

    expect(res).to.have.property('statusCode', 400)
  })

  it('404 for request with missing args', async () => {
    const res = await http({
      method: 'POST',
      url: '/api/v0/config?arg=kitten'
    }, { ipfs })

    expect(res).to.have.property('statusCode', 404)
    expect(res).to.have.nested.property('result.Code', 3)
    expect(res).to.have.nested.property('result.Message').that.is.a('string')
  })

  it('returns value for request with valid arg', async () => {
    ipfs.config.get.returns({
      API: {
        HTTPHeaders: 'value'
      }
    })

    const res = await http({
      method: 'POST',
      url: '/api/v0/config?arg=API.HTTPHeaders'
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res).to.have.nested.property('result.Key', 'API.HTTPHeaders')
    expect(res).to.have.nested.property('result.Value', 'value')
  })

  it('returns value for request as subcommand', async () => {
    ipfs.config.get.returns({
      API: {
        HTTPHeaders: 'value'
      }
    })

    const res = await http({
      method: 'POST',
      url: '/api/v0/config/API.HTTPHeaders'
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res).to.have.nested.property('result.Key', 'API.HTTPHeaders')
    expect(res).to.have.nested.property('result.Value', 'value')
  })

  it('updates value for request with both args', async () => {
    ipfs.config.get.returns({
      Datastore: {
        Path: 'not-kitten'
      }
    })

    const res = await http({
      method: 'POST',
      url: '/api/v0/config?arg=Datastore.Path&arg=kitten'
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res).to.have.nested.property('result.Key', 'Datastore.Path')
    expect(res).to.have.nested.property('result.Value', 'kitten')
    expect(ipfs.config.replace.calledWith({
      Datastore: {
        Path: 'kitten'
      }
    })).to.be.true()
  })

  it('returns 400 value for request with both args and JSON flag with invalid JSON argument', async () => {
    ipfs.config.get.returns({
      Datastore: {
        Path: 'not-kitten'
      }
    })

    const res = await http({
      method: 'POST',
      url: '/api/v0/config?arg=Datastore.Path&arg=kitten&json'
    }, { ipfs })

    expect(res).to.have.property('statusCode', 400)
    expect(res).to.have.nested.property('result.Code', 1)
    expect(res).to.have.nested.property('result.Message').that.is.a('string')
    expect(ipfs.config.replace.called).to.be.false()
  })

  it('updates value for request with both args and JSON flag with valid JSON argument', async () => {
    ipfs.config.get.returns({
      Datastore: {
        Path: 'not-kitten'
      }
    })

    const res = await http({
      method: 'POST',
      url: '/api/v0/config?arg=Datastore.Path&arg={"kitten": true}&json'
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res).to.have.nested.property('result.Key', 'Datastore.Path')
    expect(res).to.have.deep.nested.property('result.Value', { kitten: true })
    expect(ipfs.config.replace.calledWith({
      Datastore: {
        Path: {
          kitten: true
        }
      }
    })).to.be.true()
  })

  it('updates value for request with both args and bool flag and true argument', async () => {
    ipfs.config.get.returns({
      Datastore: {
        Path: 'not-kitten'
      }
    })

    const res = await http({
      method: 'POST',
      url: '/api/v0/config?arg=Datastore.Path&arg=true&bool'
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res).to.have.nested.property('result.Key', 'Datastore.Path')
    expect(res).to.have.nested.property('result.Value', true)
    expect(ipfs.config.replace.calledWith({
      Datastore: {
        Path: true
      }
    })).to.be.true()
  })

  it('updates value for request with both args and bool flag and false argument', async () => {
    ipfs.config.get.returns({
      Datastore: {
        Path: 'not-kitten'
      }
    })

    const res = await http({
      method: 'POST',
      url: '/api/v0/config?arg=Datastore.Path&arg=false&bool'
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res).to.have.nested.property('result.Key', 'Datastore.Path')
    expect(res).to.have.nested.property('result.Value', false)
    expect(ipfs.config.replace.calledWith({
      Datastore: {
        Path: false
      }
    })).to.be.true()
  })

  describe('/show', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/config/show')
    })

    it('shows config', async () => {
      const config = {
        Datastore: {
          Path: 'not-kitten'
        }
      }

      ipfs.config.get.returns(config)

      const res = await http({
        method: 'POST',
        url: '/api/v0/config/show'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('result', config)
    })
  })

  describe('/replace', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/config/replace')
    })

    it('returns 400 if no config is provided', async () => {
      const form = new FormData()
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/config/replace',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('returns 500 if the config is invalid', async () => {
      const form = new FormData()
      const filePath = 'test/fixtures/test-data/badconfig'
      form.append('file', fs.createReadStream(filePath))
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/config/replace',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 500)
    })

    it('updates value', async () => {
      const expectedConfig = {
        Key: 'value',
        OtherKey: 'otherValue',
        Deep: {
          Key: {
            Is: 'value'
          }
        },
        Array: [
          'va1',
          'val2',
          'val3'
        ]
      }
      const form = new FormData()
      form.append('file', Buffer.from(JSON.stringify(expectedConfig)))
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/config/replace',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(ipfs.config.replace.calledWith(expectedConfig)).to.be.true()
    })
  })

  describe('/profile/apply', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/config/profile/apply')
    })

    it('returns 400 if no config profile is provided', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/config/profile/apply'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('returns 400 if the config profile is invalid', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/config/profile/apply?arg=derp'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('does not apply config profile with dry-run argument', async () => {
      ipfs.config.profiles.apply.withArgs('lowpower', sinon.match({
        dryRun: true
      })).returns({
        original: {},
        updated: {}
      })

      const res = await http({
        method: 'POST',
        url: '/api/v0/config/profile/apply?arg=lowpower&dry-run=true'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })

    Object.keys(profiles).forEach(profile => {
      it(`applies config profile ${profile}`, async () => {
        ipfs.config.profiles.apply.withArgs(profile, sinon.match({
          dryRun: false
        })).returns({
          original: {},
          updated: {}
        })

        const res = await http({
          method: 'POST',
          url: `/api/v0/config/profile/apply?arg=${profile}`
        }, { ipfs })

        expect(res).to.have.property('statusCode', 200)
      })
    })
  })

  describe('/profile/list', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/config/profile/list')
    })

    it('lists available profiles', async () => {
      ipfs.config.profiles.list.returns(Object.keys(profiles).map(name => ({
        name,
        description: profiles[name].description
      })))

      const res = await http({
        method: 'POST',
        url: '/api/v0/config/profile/list'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.property('payload').that.satisfies(payload => {
        const listed = JSON.parse(payload)

        return Object.keys(profiles).reduce((acc, name) => { // eslint-disable-line max-nested-callbacks
          const profile = listed.find(profile => profile.Name === name) // eslint-disable-line max-nested-callbacks

          return acc && profile && profile.Description === profiles[name].description
        }, true)
      })
    })
  })
})
