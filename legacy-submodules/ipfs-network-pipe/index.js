var dgrams = require('dgram-stream')
var segment = require('pipe-segment')
var segcodec = require('pipe-segment-codec')
var through2 = require('through2')
var addrseg = require('./addr')
var wireseg = require('./wire')


module.exports = netPipe

function netPipe(opts, peerbook) {
  opts = opts || {}

  // errors stream
  var errors = through2.obj(function(data, enc, cb) {
    cb(null, data.toString())
  })

  // setup network socket
  var socks = dgrams('udp4')
  socks.bind(opts.port || 6130)

  // address translation node dgram <-> peerid
  var addrts = addrseg(peerbook)
  connect(addrts.encoded, socks)
  addrts.encodeErrors.pipe(errors)
  addrts.decodeErrors.pipe(errors)

  // scoped transform pipeline (payloads)
  var wire = wireseg()
  connect(wire.buffers, addrts.decoded)
  wire.wire.packingErrors.pipe(errors)
  wire.wire.unpackingErrors.pipe(errors)

  // wrap msg codec
  var wrapmsg = wrapMessages()
  connect(wrapmsg.encoded, wire.messages)
  wrapmsg.encodeErrors.pipe(errors)
  wrapmsg.decodeErrors.pipe(errors)

  return segment({
    dgrams: socks,
    messages: wrapmsg.decoded,
    errors: errors,
  })
}

function wrapMessages() {
  return segcodec(wrap, unwrap) // encode, decode

  function wrap(msg) {
    // pull out the dst, for the dgram stream
    return { payload: msg, to: msg.destination }
  }

  function unwrap(data) {
    return data.payload
  }
}

function connect(a, b) {
  a.pipe(b).pipe(a)
}
