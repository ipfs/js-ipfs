var mdns = require('multicast-dns')()
// { multicast: false })

// var serviceTag = 'discovery.ipfs.io.local'
// serviceTag = 'david.local'
// serviceTag = 'QmbBHw1Xx9pUpAbrVZUKTPL5Rsph5Q9GQhRvcWVBPFgGtC.discovery.ipfs.io.local'
var serviceTag = '_bananas._tcp.local'

mdns.on('warning', function (err) {
//  console.log('TELL ME ABOUT IT: ', err)
})

mdns.on('packet', function (message, rinfo) {
//  console.log('PACKET', message, rinfo)
})

mdns.on('response', function (response) {
  console.log('RESPONSE-> ', response)
})

mdns.on('query', function (query) {
//  console.log('QUERY -> ', query)
})

mdns.query({
  questions: [{
    name: serviceTag,
    type: 'PTR'
  }]
})
