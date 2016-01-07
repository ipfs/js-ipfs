#! /usr/bin/env node

'use strict'

const ronin = require('ronin')

const cli = ronin(__dirname)

cli.run()

// cli.autoupdate(function () {
//   cli.run()
// })
