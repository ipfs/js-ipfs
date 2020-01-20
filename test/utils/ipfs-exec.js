'use strict'

const execa = require('execa')
const path = require('path')

// This is our new test utility to easily check and execute ipfs cli commands.
//
// The top level export is a function that can be passed a `repoPath`
// and optional `opts` to customize the execution of the commands.
// This function returns the actual executer, which consists of
// `ipfs('get <hash>')` and `ipfs.fail('get <hash>')`
// The first one executes and asserts that the command ran successfully
// and returns a promise which is resolved to `stdout` of the command.
// The `.fail` variation asserts that the command exited with `Code > 0`
// and returns a promise that resolves to `stderr`.
module.exports = (repoPath, opts) => {
  const env = { ...process.env }
  env.IPFS_PATH = repoPath

  const config = Object.assign({}, {
    stripFinalNewline: false,
    env: env,
    timeout: 60 * 1000,
    all: true
  }, opts)
  const exec = (args, options) => {
    const opts = Object.assign({}, config, options)

    return execa.command(`${path.resolve(`${__dirname}/../../src/cli/bin.js`)} ${args}`, opts)
  }
  const execRaw = (args, options) => {
    const opts = Object.assign({}, config, options, {
      encoding: null
    })

    return execa.command(`${path.resolve(`${__dirname}/../../src/cli/bin.js`)} ${args}`, opts)
  }

  const execute = (exec, args, options) => {
    options = options || {}

    const cp = exec(args, options)
    const res = cp.then((res) => {
      // We can't escape the os.tmpdir warning due to:
      // https://github.com/shelljs/shelljs/blob/master/src/tempdir.js#L43
      // expect(res.stderr).to.be.eql('')
      return res.stdout
    }, err => {
      if (!options.disableErrorLog) {
        console.error(err.stderr) // eslint-disable-line no-console
      }
      throw err
    })

    res.cancel = cp.cancel.bind(cp)
    res.kill = cp.kill.bind(cp)
    res.stdin = cp.stdin
    res.stdout = cp.stdout
    res.stderr = cp.stderr
    res.all = cp.all

    return res
  }

  function ipfs (command, options) {
    return execute(exec, command, options)
  }

  // Will return buffers instead of strings
  ipfs.raw = function (command, options) {
    return execute(execRaw, command, options)
  }

  /**
   * Expect the command passed as @param arguments to fail.
   * @param {String} command String command to run, e.g. `'pin ls'`
   * @param {Object} options Options to pass to `execa`
   * @return {Promise} Resolves if the command passed as @param arguments fails,
   *                    rejects if it was successful.
   */
  ipfs.fail = function ipfsFail (command, options) {
    return ipfs(command, { disableErrorLog: true, ...(options || {}) })
      .then(() => {
        throw new Error(`jsipfs expected to fail during command: jsipfs ${command}`)
      }, (err) => {
        return err
      })
  }

  return ipfs
}
