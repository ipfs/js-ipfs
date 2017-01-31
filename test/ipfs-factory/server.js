'use strict'

const Hapi = require('hapi')

const port = Number(process.env.PORT) || 55155
const options = {
  connections: {
    routes: {
      cors: true
    }
  }
}

module.exports = (callback) => {
  const http = new Hapi.Server(options)

  http.connection({ port: port })

  http.start((err) => {
    if (err) {
      return callback(err)
    }
    require('./server-routes')(http)

    callback(null, http)
    // note: http.stop(callback) to stop the server :)
  })
}
