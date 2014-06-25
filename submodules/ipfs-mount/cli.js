#!/usr/bin/env node

var fs = require('fs')
var log = require('single-line-log')
var proc = require('child_process')
var path = require('path')
var rimraf = require('rimraf')
var prettysize = require('prettysize')
var argv = parseArgs(process.argv.slice(2))

var ipfs = require('../ipfs-core')
var umount = require('./umount')
var mount = require('./')





readTorrent(process.argv[2], function(err, torrent) {
  if (err) {
    console.error(err.message);
    process.exit(2);
  }

  var mnt = fs.realpathSync(process.argv[3] || '.');
  var engine = drive(torrent, mnt);
  var hs = 0;

  engine.on('hotswap', function() {
    hs++;
  });

  log('Initializing swarm and verifying data...\n');
  engine.on('mount', function(mnt) {
    log('Mounted '+engine.files.length+' files, '+prettysize(engine.torrent.length)+' in '+ engine.torrent.name);
    log.clear();

    var notChoked = function(result, wire) {
      return result + (wire.peerChoking ? 0 : 1);
    };

    var status = function() {
      var down = prettysize(engine.swarm.downloaded);
      var downSpeed = prettysize(engine.swarm.downloadSpeed()).replace('Bytes', 'b')+'/s';
      var up = prettysize(engine.swarm.uploaded);
      var upSpeed = prettysize(engine.swarm.uploadSpeed()).replace('Bytes', 'b')+'/s';

      log(
        'Connected to '+engine.swarm.wires.reduce(notChoked, 0)+'/'+engine.swarm.wires.length+' peers\n'+
        'Downloaded '+down+' ('+downSpeed+') with '+hs+' hotswaps\n'+
        'Uploaded '+up+ ' ('+upSpeed+')\n'
      );
    };

    var interval = setInterval(status, 500);
    status();

    var closing = false;
    process.on('SIGINT', function() {
      if (closing) return;
      clearInterval(interval);
      log('Shutting down...\n');
      closing = true;
      engine.destroy(function() {
        proc.fork(path.join(__dirname, 'destroy.js'), [mnt, ''+process.pid]);
      });
    });

    process.on('SIGTERM', function() {
      process.exit();
    });
  });
});


function parseArgs(args) {
  var argv = { ipfsPath: '/', osPath: '/ipfs' }
  switch (args.length) {
  case 2:
    argv.ipfsPath = args[0]
    argv.osPath = args[1]
    break
  case 1:
    argv.osPath = args[0]
    break
  case 0:
    break
  }
  return argv
}
