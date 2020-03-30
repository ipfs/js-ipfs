'use strict'

const { promisify } = require('util')
const http = require('http')
const url = require('url')
const querystring = require('querystring')

const echoServer = async (port = 3000) => {
  const server = http.createServer()

  server.on('request', (request, response) => {
    try {

    const uri = url.parse(request.url)
    const qs = uri.query ? querystring.parse(uri.query) : {}
    const status = qs.status || 200
    const contentType = qs.contentType || 'text/plain'

    const headers = {
      'Access-Control-Allow-Origin': '*'
    }

    if (qs.body) {
      headers['Content-Type'] = contentType
      headers['Content-Length'] = qs.body.length
    }

    response.writeHead(status, headers)

    if (qs.body) {
      response.end(qs.body)
    } else {
      request.pipe(response)
    }

    } catch (err) {
      console.error(err)
    }
  })

  await promisify(server.listen.bind(server))(port)

  return {
    stop: promisify(server.close.bind(server))
  }
}

let echo

module.exports = {
  hooks: {
    pre: async () => {
      echo = await echoServer()
    },
    post: async () => {
      await echo.stop()
    }
  }
}
