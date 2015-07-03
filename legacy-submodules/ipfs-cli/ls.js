var base58 = require('base58-native')

module.exports = ls

function ls(ipfs, argv) {
  if (argv._args.length == 0) {
    console.error('ipfs ls <ipfs-path>')
    process.exit(-1)
  }

  var path = argv._args[0]
  ipfs.resolver.resolve(path, function(err, obj) {
    if (err && err == ipfs.resolver.errors.NotFoundError)
      return die('ipfs ls: ' + path + ' not found.')
    if (err)
      return die('ipfs ls: ' + err)

    printLinks(obj.links())
  })
}

function printLinks(links) {
  for (var l in links) {
    var link = links[l]
    var hash = base58.encode(link.hash)
    console.log(hash + ' ' + link.size.toString() + ' ' + link.name)
  }
}

function die(err) {
  console.error(err)
  process.exit(-1)
}
