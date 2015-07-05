var mdns = require('multicast-dns')()
var Id = require('./../../routers/dht/peer/id')
var Peer = require('./../../routers/dht/peer')
var Multiaddr = require('multiaddr')
var log = require('ipfs-logger').group('discovery')

exports = module.exports = sonar

function sonar (cb) {
  var serviceTag = 'discovery.ipfs.io.local'

  mdns.on('warning', function (err) {
    cb(err)
  })

  mdns.on('response', function (response) {
    if (!response.answers) {
      return
    }

    var answers = {
      ptr: {},
      srv: {},
      txt: {},
      a: []
    }

    response.answers.forEach(function (answer) {
      switch (answer.type) {
        case 'PTR': answers.ptr = answer; break
        case 'SRV': answers.srv = answer; break
        case 'TXT': answers.txt = answer; break
        case 'A': answers.a.push(answer); break
        default: break
      }
    })

    if (answers.ptr.name !== serviceTag) {
      return
    }

    var b58Id = answers.txt.data
    var port = answers.srv.data.port
    var multiaddrs = []

    answers.a.forEach(function (a) {
      multiaddrs.push(new Multiaddr('/ip4/' + a.data + '/tcp/' + port))
    })

    log.info('peer found -', b58Id)
    var peerId = Id.createFromB58String(b58Id)
    cb(null, new Peer(peerId, multiaddrs))
  })

  mdns.on('query', function (query) {
    // answer with PTR, SRV and A for several IP addr
  })

  setInterval(function () {
    mdns.query({
      questions: [{
        name: serviceTag,
        type: 'PTR'
      }]
    })
  }, 1e3 * 5)
}

/* for reference

   [ { name: 'discovery.ipfs.io.local',
       type: 'PTR',
       class: 1,
       ttl: 120,
       data: 'QmbBHw1Xx9pUpAbrVZUKTPL5Rsph5Q9GQhRvcWVBPFgGtC.discovery.ipfs.io.local' },

     { name: 'QmbBHw1Xx9pUpAbrVZUKTPL5Rsph5Q9GQhRvcWVBPFgGtC.discovery.ipfs.io.local',
       type: 'SRV',
       class: 1,
       ttl: 120,
       data: { priority: 10, weight: 1, port: 4001, target: 'lorien.local' } },

     { name: 'lorien.local',
       type: 'A',
       class: 1,
       ttl: 120,
       data: '127.0.0.1' },

     { name: 'lorien.local',
       type: 'A',
       class: 1,
       ttl: 120,
       data: '127.94.0.1' },

     { name: 'lorien.local',
       type: 'A',
       class: 1,
       ttl: 120,
       data: '172.16.38.224' },

     { name: 'QmbBHw1Xx9pUpAbrVZUKTPL5Rsph5Q9GQhRvcWVBPFgGtC.discovery.ipfs.io.local',
       type: 'TXT',
       class: 1,
       ttl: 120,
       data: 'QmbBHw1Xx9pUpAbrVZUKTPL5Rsph5Q9GQhRvcWVBPFgGtC' } ],

*/
