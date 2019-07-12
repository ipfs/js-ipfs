'use strict'

const content = require('@hapi/content')
const Parser = require('./parser')

module.exports = {
  Parser: Parser,
  reqParser: (req) => {
    const boundary = content.type(req.headers['content-type']).boundary
    const parser = new Parser({ boundary: boundary })
    req.pipe(parser)
    return parser
  }
}
