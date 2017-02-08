'use strict'

const execa = require('execa')
const expect = require('chai').expect
const _ = require('lodash')

// This is our new test utility to easily check and execute
// ipfs cli commands.
//
// The top level export is a function that can be passed a `repoPath`
// and optional `opts` to customize the execution of the commands.
// This function returns the actual executer, which consists of
// `ipfs('files get <hash>')` and `ipfs.fail('files get <hash>')`
// The first one executes and asserts that the command ran successfully
// and returns a promise which is resolved to `stdout` of the command.
// The `.fail` variation asserts that the command exited with `Code > 0`
// and returns a promise that resolves to `stderr`.
module.exports = (repoPath, opts) => {
  const env = _.clone(process.env)
  env.IPFS_PATH = repoPath

  const config = Object.assign({}, {
    stripEof: true,
    env: env,
    timeout: 60 * 1000
  }, opts)

  const exec = (args) => execa(`${process.cwd()}/src/cli/bin.js`, args, config)

  function ipfs () {
    let args = Array.from(arguments)
    if (args.length === 1) {
      args = args[0].split(' ')
    }

    const cp = exec(args)
    const res = cp.then((res) => {
      // We can't escape the os.tmpdir warning due to:
      // https://github.com/shelljs/shelljs/blob/master/src/tempdir.js#L43
      // expect(res.stderr).to.be.eql('')
      return res.stdout
    })

    res.kill = cp.kill.bind(cp)
    res.stdout = cp.stdout
    res.stderr = cp.stderr

    return res
  }

  ipfs.fail = function ipfsFail () {
    let args = Array.from(arguments)
    if (args.length === 1) {
      args = args[0].split(' ')
    }

    return exec(args).catch((err) => {
      expect(err).to.exist
    })
  }

  return ipfs
}
