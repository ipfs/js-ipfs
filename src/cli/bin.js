#! /usr/bin/env node

var ronin = require('ronin')

var cli = ronin(__dirname)

cli.run()

// cli.autoupdate(function () {
//   cli.run()
// })
