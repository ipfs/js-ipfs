'use strict'

const argv = require('yargs')
const receiveFiles = require('./receive-files')
const addFile = require('./add-file')

argv
  .usage('Usage: $0 <command>')
  .command({
    command: 'listen <feed>',
    desc: 'Receive new files from peers',
    handler: (argv) => receiveFiles(argv.feed)
  })
  .command({
    command: 'add <feed> <filename>',
    desc: 'Add a file to a feed',
    handler: (argv) => addFile(argv.feed, argv.filename)
  })
  .demand(1)
  .help('help')
  .alias('h', 'help')
  .argv
