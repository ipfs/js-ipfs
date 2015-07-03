var Object = require('./')
var log = console.log

var a = Object({ data: new Buffer("aaa") })
var b = Object({ data: new Buffer("bbb") })
var c = Object({
  data: new Buffer("ccc"),
  links: [
    Object.link(a.multihash(), "a", 10),
    {hash: b.multihash(), name: "b", size: 10 },
  ]
})

log(c.data())
// new Buffer("ccc")

log(c.links())
// [
//  {hash: new Buffer(...), name: "a", size: 10 },
//  {hash: new Buffer(...), name: "b", size: 10 },
//]

log(c.decode())
// { data: new Buffer("ccc"),
//   links: [
//     {hash: new Buffer(...), name: "a", size: 10 },
//     {hash: new Buffer(...), name: "b", size: 10 } ] }
