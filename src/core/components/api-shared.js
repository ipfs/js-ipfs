const multipart = require('ipfs-multipart')
const bl = require('bl')
const fs = require('fs')

module.exports = {
  readFileFromRequestPayload: (request, reply) => {
    const parser = multipart.reqParser(request.payload)
    var file

    parser.on('file', (fileName, fileStream) => {
      file = Buffer.alloc(0)

      fileStream.on('data', (data) => {
        file = Buffer.concat([file, data])
      })
    })

    parser.on('end', () => {
      if (!file) {
        return reply({
          Message: "File argument 'data' is required",
          Code: 0
        }).code(400).takeover()
      }

      return reply({
        data: file
      })
    })
  },
  readFileFromPathOrStdin: (argName) => {
    return (argv, callback) => {
      const arg = argv[argName]
      if (arg) {
        const buf = fs.readFileSync(arg)
        return callback(null, {data: buf})
      }

      process.stdin.pipe(bl((err, res) => {
        if (err) return callback(err)
        callback(null, {data: res})
      }))
    }
  }
}
