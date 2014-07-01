var xtend = require('xtend')
var stream = require('readable-stream')
var segment = require('pipe-segment')
var netpipe = require('../ipfs-network-pipe')
var Message = require('../ipfs-message')
var through2 = require('through2')
var noop = function() {}

module.exports = ipfsNetwork

var sopts = {objectMode: true, highWaterMark: 16}


//             multiplexes protocols over the netpipe wire
//  dht --->                                                   ---> dht
// xchg ---> outgoing --> join --> wire --> split --> incoming ---> xchng
// idnt --->                                                   ---> idnt
function ipfsNetwork(opts, peerbook, protocolStreams) {
  opts = opts || {}

  // main network pipe
  var wire = netpipe(opts, peerbook)

  // make the multiplexing pipes
  var unknown = stream.PassThrough(sopts)
  var outgoing = stream.PassThrough(sopts)
  var incoming = stream.Writable(sopts)
  incoming._write = multiplexInput

  // wire pipes
  outgoing.pipe(joinPayloads()).pipe(wire.messages)
  wire.messages.pipe(splitPayloads()).pipe(incoming)

  // proto pipes (using numbers)
  var protocols = {}
  for (var k in protocolStreams) {
    var s = protocolStreams[k]
    protocols[k] = s
    s.pipe(outgoing) // pipe all into outgoing
  }

  return segment({
    wire: wire,
    unknown: unknown,
    protocols: protocols,
  })

  function multiplexInput(item, enc, next) {
    var proto = protocols[protoTable[item.protocol]]
    if (proto) {
      proto.write(item)
    } else {
      unknown.write({
        error: new Error('unknown protocol'),
        message: item,
      })
    }
    next()
  }
}

var protoTable = {
  1: 'identity',
  2: 'routing',
  3: 'exchange',
}

// splits all the payloads in each message
function splitPayloads() {
  return through2.obj(function(msg, enc, next) {
    for (var p in msg.payload) {
      var pp = msg.payload[p]
      this.push({
        data: pp.data,
        protocol: pp.protocol,
        source: msg.source,
        destination: msg.destination,
      })
    }
    next()
  })
}

// joins payloads in a stream into one packet
// for now, one payload / pkt. coalesce smartly later.
function joinPayloads() {
  return through2.obj(function(p, enc, next) {
    this.push(Message(p.source, p.destination,
        [ {data: p.data, protocol: p.protocol} ]))
    next()
  })
}
