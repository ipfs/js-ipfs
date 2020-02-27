'use strict'

const { parseArgsStringToArgv } = require('string-argv')
const cli = require('../../src/cli')

const output = () => {
  const output = []

  const print = (line, includeNewline = true) => {
    if (includeNewline) {
      line = `${line}\n`
    }

    output.push(line)
  }
  print.clearLine = () => {
    output.pop()
  }
  print.cursorTo = () => {}
  print.write = (data) => {
    output.push(data)
  }
  print.error = print
  print.getOutput = () => {
    if (output.length) {
      return output.join('')
    }

    return ''
  }
  // used by ipfs.add to interrupt the progress bar
  print.isTTY = true

  return print
}

module.exports = async (command, ctx) => {
  const print = output()

  command = parseArgsStringToArgv(command)

  await cli(command, (args) => {
    args.ctx = {
      print,
      ...ctx
    }
  })

  return print.getOutput()
}

module.exports.fail = async (command, ctx) => {
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

  return print.getOutput()
}
