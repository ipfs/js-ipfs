'use strict'

const { parseArgsStringToArgv } = require('string-argv')
const cli = require('../../src')
const { toString: uint8ArrayToString } = require('@vascosantos/uint8arrays/to-string')

const output = () => {
  const output = []

  const print = (line, includeNewline = true) => {
    if (includeNewline) {
      line = `${line}\n`
    }

    output.push(Buffer.from(line))
  }
  print.clearLine = () => {
    output.pop()
  }
  print.cursorTo = () => {}
  print.write = (data) => {
    output.push(Buffer.from(data))
  }
  print.error = print
  print.getOutput = () => {
    return Buffer.concat(output)
  }
  // used by ipfs.add to interrupt the progress bar
  print.isTTY = true

  return print
}

module.exports = async (command, ctx = {}) => {
  const print = output()

  command = parseArgsStringToArgv(command)

  await cli(command, (args) => {
    args.ctx = {
      print,
      ...ctx
    }
  })

  const out = print.getOutput()

  if (ctx.raw) {
    return out
  }

  return uint8ArrayToString(out)
}

module.exports.fail = async (command, ctx = {}) => {
  const print = output()

  command = parseArgsStringToArgv(command)

  try {
    await cli(command, (args) => {
      args.ctx = {
        print,
        ...ctx
      }
    })

    throw new Error('Command did not error')
  } catch (err) {
    if (err.message === 'Command did not error') {
      throw err
    }

    print(err.message)
  }

  const out = print.getOutput()

  if (ctx.raw) {
    return out
  }

  return uint8ArrayToString(out)
}
