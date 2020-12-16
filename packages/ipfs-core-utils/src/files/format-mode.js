'use strict'

const S_ISUID = parseInt('4000', 8) //   set UID bit
const S_ISGID = parseInt('2000', 8) //   set-group-ID bit (see below)
const S_ISVTX = parseInt('1000', 8) //   sticky bit (see below)
// const S_IRWXU = parseInt('700', 8) //    mask for file owner permissions
const S_IRUSR = parseInt('400', 8) //    owner has read permission
const S_IWUSR = parseInt('200', 8) //    owner has write permission
const S_IXUSR = parseInt('100', 8) //    owner has execute permission
// const S_IRWXG = parseInt('70', 8) //     mask for group permissions
const S_IRGRP = parseInt('40', 8) //     group has read permission
const S_IWGRP = parseInt('20', 8) //     group has write permission
const S_IXGRP = parseInt('10', 8) //     group has execute permission
// const S_IRWXO = parseInt('7', 8) //      mask for permissions for others (not in group)
const S_IROTH = parseInt('4', 8) //      others have read permission
const S_IWOTH = parseInt('2', 8) //      others have write permission
const S_IXOTH = parseInt('1', 8) //      others have execute permission

function checkPermission (mode, perm, type, output) {
  if ((mode & perm) === perm) {
    output.push(type)
  } else {
    output.push('-')
  }
}

/**
 *
 * @param {import('ipfs-core-types/src/files').Mode} mode
 * @param {boolean} isDirectory
 * @returns {string}
 */
function formatMode (mode, isDirectory) {
  const output = []

  if (isDirectory) {
    output.push('d')
  } else {
    output.push('-')
  }

  checkPermission(mode, S_IRUSR, 'r', output)
  checkPermission(mode, S_IWUSR, 'w', output)

  if ((mode & S_ISUID) === S_ISUID) {
    output.push('s')
  } else {
    checkPermission(mode, S_IXUSR, 'x', output)
  }

  checkPermission(mode, S_IRGRP, 'r', output)
  checkPermission(mode, S_IWGRP, 'w', output)

  if ((mode & S_ISGID) === S_ISGID) {
    output.push('s')
  } else {
    checkPermission(mode, S_IXGRP, 'x', output)
  }

  checkPermission(mode, S_IROTH, 'r', output)
  checkPermission(mode, S_IWOTH, 'w', output)

  if ((mode & S_ISVTX) === S_ISVTX) {
    output.push('t')
  } else {
    checkPermission(mode, S_IXOTH, 'x', output)
  }

  return output.join('')
}

module.exports = formatMode
