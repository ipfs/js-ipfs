module.exports = cat

function cat(ipfs, argv) {
  if (argv._args.length == 0) {
    console.error('ipfs cat <ipfs-path>')
    process.exit(-1)
  }

  var path = argv._args[0]
  ipfs.resolver.resolve(path, function(err, obj) {
    if (err && err == ipfs.resolver.errors.NotFoundError)
      return die('ipfs cat: ' + path + ' not found.')
    if (err)
      return die('ipfs cat: ' + err)

    process.stdout.write(obj.data())
  })
}

function die(err) {
  console.error(err)
  process.exit(-1)
}
