var log = console.log
var Block = logCall(require('./block'))
var List = logCall(require('./list'))
var Tree = logCall(require('./tree'))
var Commit = logCall(require('./commit'))

var b1 = Block({data: new Buffer("b1b1b1")})
var b2 = Block({data: new Buffer("b1b1b1")})
var b3 = Block({data: new Buffer("b3b3b3")})

var l1 = List([b1, b2, b3])
var l2 = List([b1, b2, b3])
var l3 = List([b1, b2, b2, b2, b3, b3])
var l4 = List([b1, l1, l1, l2])
var l5 = List({data: {items: [0, 1, 2]}, links: [b1.link(), b2.link(), b3.link()]})

var t1 = Tree({'b1': b1, 'b2': b2, 'b3': b3})
var t2 = Tree({'l1': l1, 'l2': l2, 'l3': l3})
var t3 = Tree({'b1': b1, 'l2': b2, 't1': t1})

var c1 = Commit({
  parent: b1,
  object: b2,
  author: b3,
  date: new Date(),
  type: 'block',
  message: 'foo',
})


// call + log
function logCall(func) {
  return function() {
    log('-------------------------------------------------')
    log('construct ' + func.name)
    var r = func.apply(this, arguments)
    log(r.buffer.toString('hex'))
    return r
  }
}
