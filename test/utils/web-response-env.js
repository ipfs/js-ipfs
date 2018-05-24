'use strict'

class Response {
  constructor (body, init) {
    this.body = body || ''
    this.status = (init && typeof init.status === 'number') ? init.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = (init && init.statusText) || 'OK'
    this.headers = (init && init.headers)

    this.type = this.status === 0 ? 'opaque' : 'basic'
    this.redirected = false
    this.url = (init && init.url) || 'http://example.com/asset'
  }

  redirect (url) {
    return {
      status: 200,
      url: url
    }
  }
}

class WebResponseGlobalScope {
  constructor () {
    this.Response = Response
    this.Response.redirect = (url) => url
  }
}

module.exports = () => new WebResponseGlobalScope()
