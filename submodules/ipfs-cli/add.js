var fs = require('fs')
var Git = require('../ipfs-objects-git')
var Path = require('../ipfs-path')

module.exports = add

function add(ipfs, args) {
  if (args.length == 0) {
    console.error('ipfs add <local-path>')
    process.exit(-1)
  }

  var path = args[0]
  var data = fs.readFileSync(path)
  var block = Git.Block({data: new Buffer(data)})

  ipfs.blocks.putObject(block, function(err, key, val) {
    if (err) return die(err)
    console.log('added ' + Path(block))
  })
}

function die(err) {
  console.error('ipfs add: ' + err)
  process.exit(-1)
}
