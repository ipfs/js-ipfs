'use strict'

const series = require('async/series')
const IPFS = require('ipfs')

const node = new IPFS()
let fileMultihash

series([
  (cb) => node.on('ready', cb),
  (cb) => node.version((err, version) => {
    if (err) { return cb(err) }
    console.log('Version:', version.version)
    cb()
  }),
  (cb) => node.files.add({
    path: 'hello.txt',
    content: Buffer.from('Hello World 101')
  }, (err, result) => {
    if (err) { return cb(err) }

    console.log('\nAdded file:', result[0].path, result[0].hash)
    fileMultihash = result[0].hash
    cb()
  }),
  (cb) => node.files.cat(fileMultihash, (err, stream) => {
    if (err) { return cb(err) }

    console.log('\nFile content:')
    stream.pipe(process.stdout)
    stream.on('end', process.exit)
  })
])
