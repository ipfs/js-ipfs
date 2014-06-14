var ipfsStorage = require('./')
var storage = ipfsStorage()

storage.put('hello', 'world', function(err) {
  if (err) throw err
  storage.get('hello', function(err, val) {
    if (err) throw err
    console.log('hello ' + val.toString())
  })
})
