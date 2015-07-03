var umount = require('./umount')

var mnt = process.argv[2]
var pid = Number(process.argv[3])

umount(mnt, function() {
  process.kill(pid, 'SIGTERM')
})
