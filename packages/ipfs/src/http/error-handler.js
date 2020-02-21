'use strict'

module.exports = server => {
  server.ext('onPreResponse', (request, h) => {
    const res = request.response

    if (!res.isBoom) {
      return h.continue
    }

    const message = res.message || res.output.payload.message
    const { statusCode } = res.output.payload
    let code

    if (res.data && res.data.code != null) {
      code = res.data.code
    } else {
      // Map status code to error code as defined by go-ipfs
      // https://github.com/ipfs/go-ipfs-cmdkit/blob/0262a120012063c359727423ec703b9649eec447/error.go#L12-L20
      if (statusCode >= 400 && statusCode < 500) {
        code = statusCode === 404 ? 3 : 1
      } else {
        code = 0
      }
    }

    if (process.env.DEBUG || statusCode >= 500) {
      const { req } = request.raw
      const debug = {
        method: req.method,
        url: request.url.path,
        headers: req.headers,
        info: request.info,
        payload: request.payload,
        response: res.output.payload
      }

      server.logger().error(debug)
      server.logger().error(res)
    }

    return h.response({
      Message: message,
      Code: code,
      Type: 'error'
    }).code(statusCode)
  })
}
