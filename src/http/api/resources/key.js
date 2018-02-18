'use strict'

exports = module.exports

function applyError (reply, err) {
  reply({
    Message: err.message,
    Code: 0
  }).code(500).takeover()
}

function toKeyInfo (key) {
  return {
    Name: key.name,
    Id: key.id
  }
}

exports.list = (request, reply) => {
  const ipfs = request.server.app.ipfs

  ipfs._keychain.listKeys((err, keys) => {
    if (err) {
      return applyError(reply, err)
    }

    keys = keys.map(toKeyInfo)
    return reply({ Keys: keys })
  })
}

exports.rm = (request, reply) => {
  const ipfs = request.server.app.ipfs
  const name = request.query.arg
  ipfs._keychain.removeKey(name, (err, key) => {
    if (err) {
      return applyError(reply, err)
    }

    return reply({ Keys: [ toKeyInfo(key) ] })
  })
}

exports.rename = (request, reply) => {
  const ipfs = request.server.app.ipfs
  const oldName = request.query.arg[0]
  const newName = request.query.arg[1]
  ipfs._keychain.renameKey(oldName, newName, (err, key) => {
    if (err) {
      return applyError(reply, err)
    }

    const result = {
      Was: oldName,
      Now: key.name,
      Id: key.id,
      Overwrite: false
    }
    return reply(result)
  })
}

exports.gen = (request, reply) => {
  const ipfs = request.server.app.ipfs
  const name = request.query.arg
  const type = request.query.type
  const size = request.query.size
  ipfs._keychain.createKey(name, type, size, (err, key) => {
    if (err) {
      return applyError(reply, err)
    }

    return reply(toKeyInfo(key))
  })
}

exports.export = (request, reply) => {
  const ipfs = request.server.app.ipfs
  const name = request.query.arg
  const password = request.query.password
  ipfs._keychain.exportKey(name, password, (err, pem) => {
    if (err) {
      return applyError(reply, err)
    }

    return reply(pem).type('application/x-pem-file')
  })
}

exports.import = (request, reply) => {
  const ipfs = request.server.app.ipfs
  const name = request.query.arg
  const pem = request.query.pem
  const password = request.query.password
  ipfs._keychain.importKey(name, pem, password, (err, key) => {
    if (err) {
      return applyError(reply, err)
    }

    return reply(toKeyInfo(key))
  })
}
