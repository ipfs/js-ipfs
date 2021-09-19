
import { parseArgsStringToArgv } from 'string-argv'
import { cli } from '../../src/index.js'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

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

export default async function (command, ctx = {}) {
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
  } catch (/** @type {any} */ err) {
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
