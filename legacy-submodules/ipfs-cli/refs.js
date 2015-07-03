var base58 = require('base58-native')

module.exports = refs

function refs(ipfs, argv) {
  if (argv._args.length == 0) {
    console.error('ipfs refs [-r, --recursive] [-d, --depth int] <ipfs-path>')
    process.exit(-1)
  }

  var path = argv._args[0]
  ipfs.resolver.resolve(path, function(err, obj) {
    if (err && err == ipfs.resolver.errors.NotFoundError)
      return die('ipfs refs: ' + path + ' not found.')
    if (err)
      return die('ipfs refs: ' + err)

    depth = (argv.r || argv.recursive) ? Infinity : (argv.d || argv.depth)
    walker(ipfs)(obj, depth)
  })
}

function walker(ipfs) {
  return function walkObject(obj, depth) {
    if (!depth) return

    var links = obj.links()
    for (var l in links) {
      var link = links[l]

      printHash(link)
      if (depth <= 0)
        continue

      ipfs.blocks.getObject(link.hash, function(err, key, obj) {
        if (err) die('ipfs refs (' + key + '): ' + err)
        walkObject(obj, depth - 1)
      })
    }
  }
}

function printHash(link) {
  console.log(base58.encode(link.hash))
}

function die(err) {
  console.error(err)
  process.exit(-1)
}
