var assert = require('assert')
var Peer = require('../ipfs-peer')
var PeerBook = require('./')

p1 = Peer('111448181acd22b3edaebc8a447868a7df7ce629920a')
p2 = Peer('111433667000f223ce8b688dd4de29962c81bb9afb63')

pb = PeerBook()
pb.add(p1)
pb.add(p2)
assert.equal(p1, pb.get('111448181acd22b3edaebc8a447868a7df7ce629920a'))
assert.equal(p2, pb.get('111433667000f223ce8b688dd4de29962c81bb9afb63'))
console.log('ok')
