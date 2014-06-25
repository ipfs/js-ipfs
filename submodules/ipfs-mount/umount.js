// verbatim from mafintosh/torrent-mount/umount.js
var proc = require('child_process')

var noop = function() {}

var spawn = function(cmd, args, cb) {
  var ps = proc.spawn(cmd, args)
  var done = function() {
    ps.removeListener('error', done)
    ps.removeListener('exit', done)
    cb()
  };
  ps.on('exit', done)
  ps.on('error', done)
};

module.exports = function(dir, cb) { // this is horrible - must be a better way to do this
  spawn('umount', [dir], function() {
    spawn('fusermount', ['-u', dir], function() {
      if (cb) cb()
    })
  })
}
