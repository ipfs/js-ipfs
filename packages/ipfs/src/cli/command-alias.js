'use strict'

const aliases = {
  // We need to be able to show help text for both the `refs` command and the
  // `refs local` command, but with yargs `refs` cannot be both a command and
  // a command directory. So alias `refs local` to `refs-local`
  'refs-local': ['refs', 'local']
}

// Replace multi-word command with alias
// eg replace `refs local` with `refs-local`
module.exports = function (args) {
  for (const [alias, original] of Object.entries(aliases)) {
    if (arrayMatch(args, original)) {
      return [alias, ...args.slice(original.length)]
    }
  }

  return args
}

// eg arrayMatch([1, 2, 3], [1, 2]) => true
function arrayMatch (arr, sub) {
  if (sub.length > arr.length) {
    return false
  }

  for (let i = 0; i < sub.length; i++) {
    if (arr[i] !== sub[i]) {
      return false
    }
  }

  return true
}
