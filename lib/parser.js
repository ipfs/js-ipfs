'use strict'

const Dicer = require('dicer')
const Content = require('content')
const stream = require('stream')
const util = require('util')
const Transform = stream.Transform

const multipartFormdataType = 'multipart/form-data'
const applicationDirectory = 'application/x-directory'
const applicationSymlink = 'application/symlink'

const isDirectory = (mediatype) => mediatype === multipartFormdataType || mediatype === applicationDirectory

const parseDisposition = (disposition) => {
  const details = {}
  details.type = disposition.split(';')[0]
  if (details.type === 'file' || details.type === 'form-data') {
    const namePattern = /\ filename=\"(.[^\"]+)\"/
    const matches = disposition.match(namePattern)
    details.name = matches ? matches[1] : ''
  }

  return details
}

const parseHeader = (header) => {
  const type = Content.type(header['content-type'][0])
  const disposition = parseDisposition(header['content-disposition'][0])

  const details = type
  details.name = disposition.name
  details.type = disposition.type

  return details
}

function Parser (options) {
  // allow use without new
  if (!(this instanceof Parser)) {
    return new Parser(options)
  }

  this.dicer = new Dicer({ boundary: options.boundary })

  this.dicer.on('part', (part) => this.handlePart(part))

  this.dicer.on('error', (err) => this.emit('err', err))

  this.dicer.on('finish', () => {
    this.emit('finish')
    this.emit('end')
  })

  Transform.call(this, options)
}
util.inherits(Parser, Transform)

Parser.prototype._transform = function (chunk, enc, cb) {
  this.dicer.write(chunk, enc)
  cb()
}

Parser.prototype._flush = function (cb) {
  this.dicer.end()
  cb()
}

Parser.prototype.handlePart = function (part) {
  part.on('header', (header) => {
    const partHeader = parseHeader(header)

    if (isDirectory(partHeader.mime)) {
      part.on('data', () => false)
      this.emit('directory', partHeader.name)
      return
    }

    if (partHeader.mime === applicationSymlink) {
      part.on('data', (target) => this.emit('symlink', partHeader.name, target.toString()))
      return
    }

    if (partHeader.boundary) {
      // recursively parse nested multiparts
      const parser = new Parser({ boundary: partHeader.boundary })
      parser.on('file', (file) => this.emit('file', file))
      part.pipe(parser)
      return
    }

    this.emit('file', partHeader.name, part)
  })
}

module.exports = Parser
