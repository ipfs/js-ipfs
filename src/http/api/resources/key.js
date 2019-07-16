'use strict'

function toKeyInfo (key) {
  return {
    Name: key.name,
    Id: key.id
  }
}

exports.list = async (request, h) => {
  const { ipfs } = request.server.app
  const keys = await ipfs.key.list()
  return h.response({ Keys: keys.map(toKeyInfo) })
}

exports.rm = async (request, h) => {
  const { ipfs } = request.server.app
  const name = request.query.arg
  const key = await ipfs.key.rm(name)
  return h.response({ Keys: [toKeyInfo(key)] })
}

exports.rename = async (request, h) => {
  const { ipfs } = request.server.app
  const [oldName, newName] = request.query.arg
  const key = await ipfs.key.rename(oldName, newName)
  return h.response({
    Was: key.was,
    Now: key.name,
    Id: key.id,
    Overwrite: key.overwrite
  })
}

exports.gen = async (request, h) => {
  const { ipfs } = request.server.app
  const { arg, type, size } = request.query
  const key = await ipfs.key.gen(arg, { type, size: parseInt(size) })
  return h.response(toKeyInfo(key))
}

exports.export = async (request, h) => {
  const { ipfs } = request.server.app
  const { arg: name, password } = request.query
  const pem = await ipfs.key.export(name, password)
  return h.response(pem).type('application/x-pem-file')
}

exports.import = async (request, h) => {
  const { ipfs } = request.server.app
  const { arg: name, pem, password } = request.query
  const key = await ipfs.key.import(name, pem, password)
  return h.response(toKeyInfo(key))
}
