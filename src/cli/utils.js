'use strict'

let visible = true

const disablePrinting = () => {
  visible = false
}

const print = (msg = '', newline = true) => {
  if (!visible) {
    return
  }

  msg = newline ? msg + '\n' : msg
  process.stdout.write(msg)
}

module.exports = {
  disablePrinting,
  print
}
