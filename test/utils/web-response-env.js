'use strict'

class Response {
  constructor (body, init) {
    this.body = body || ''
    this.status = (init && typeof init.status === 'number') ? init.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = (init && init.statusText) || 'OK'
    this.headers = new Map(init && init.headers ? Object.entries(init.headers) : [])

    this.type = this.status === 0 ? 'opaque' : 'basic'
    this.url = (init && init.url) || 'http://example.com/asset'
  }
}

class WebResponseGlobalScope {
  constructor () {
    this.Response = Response
    this.Response.redirect = (url) => new Response(null, {
      status: 302,
      headers: { Location: url }
    })
  }
}

module.exports = () => new WebResponseGlobalScope()
