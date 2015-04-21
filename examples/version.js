var ipfs = require('../')('localhost', 5001);

ipfs.commands(function(err, res) {
	console.log(res)
})
