'use strict'

const yargs = require('yargs')
const utils = require('../../src/cli/utils')
const debug = require('debug')('jsipfs:ipfs-exec')
// const execa = require('execa')
// const chai = require('chai')
// const dirtyChai = require('dirty-chai')
// const expect = chai.expect
// chai.use(dirtyChai)

// const _ = require('lodash')

// This is our new test utility to easily check and execute ipfs cli commands.
//
// The top level export is a function that can be passed a `repoPath`
// and optional `opts` to customize the execution of the commands.
// This function returns the actual executer, which consists of
// `ipfs('files get <hash>')` and `ipfs.fail('files get <hash>')`
// The first one executes and asserts that the command ran successfully
// and returns a promise which is resolved to `stdout` of the command.
// The `.fail` variation asserts that the command exited with `Code > 0`
// and returns a promise that resolves to `stderr`.
module.exports = function ipfsExec (repoPath) {
  process.env.IPFS_PATH = repoPath

  return function (args) {
    const argv = args.split(' ')
    debug('Running', argv)
    const cliToLoad = argv[0]
    let cli = require('../../src/cli/commands/' + cliToLoad)

    const description = cli.describe || cli.description || ''
    const parser = yargs.command(cli.command, description, cli.builder, cli.handler)
    debug('Parsed command')
    return new Promise((resolve, reject) => {
      let output = []
      let cleanup = () => {
        debug('WARNING: placeholder cleanup called...')
      }
      const onComplete = (err) => {
        if (err) return reject(err)
        debug('onComplete called')
        cleanup((err) => {
          if (err) return reject(err)
          resolve(output.join(''))
        })
      }
      if (argv[0] === 'init') {
        debug('Init called, getting IPFS')
        utils.getIPFS({api: false}, (err, ipfs, _cleanup) => {
          if (err) throw err
          ipfs.once('init', () => {
            debug('Got init event, time to cleanup')
            _cleanup(resolve)
          })
          debug('Got IPFS node, initting')
          ipfs.init()
        })
      } else {
        var stream = require('stream')
        var writable = new stream.Writable({
          write: function (chunk, encoding, next) {
            output.push(chunk.toString())
            if (chunk.toString() === 'Daemon is ready\n') {
              onComplete()
            }
            next()
          }
        })
        utils.setPrintStream(writable)

        yargs().option('api').parse(argv, (err, getIPFSArgs, output) => {
          if (err) throw err
          // console.log(utils.isDaemonOn())
          // utils.getIPFS(getIPFSArgs, (err, ipfs, _cleanup) => {
            // utils.getIPFS(Object.assign(getIPFSArgs, {api: false}), (err, ipfs, _cleanup) => {
          // console.log('daemon?', argv[0])
          const api = argv[0] === 'daemon' ? '/ip4/127.0.0.1/tcp/5002' : false
          utils.getIPFS(Object.assign(getIPFSArgs, {api}), (err, ipfs, _cleanup) => {
            if (err) throw err
            cleanup = _cleanup
            parser.parse(argv, {ipfs, onComplete}, (err, argv, _output) => {
              if (err) return reject(err)
            })
          })
        })
      }
    })
  }
}
// module.exports = (repoPath, opts) => {
//   const env = _.clone(process.env)
//   env.IPFS_PATH = repoPath
//
//   const config = Object.assign({}, {
//     stripEof: false,
//     env: env,
//     timeout: 60 * 1000
//   }, opts)
//
//   const exec = (args) => execa(`${process.cwd()}/src/cli/bin.js`, args, config)
//
//   function ipfs () {
//     let args = Array.from(arguments)
//     if (args.length === 1) {
//       args = args[0].split(' ')
//     }
//
//     const cp = exec(args)
//     const res = cp.then((res) => {
//       // We can't escape the os.tmpdir warning due to:
//       // https://github.com/shelljs/shelljs/blob/master/src/tempdir.js#L43
//       // expect(res.stderr).to.be.eql('')
//       return res.stdout
//     })
//
//     res.kill = cp.kill.bind(cp)
//     res.stdout = cp.stdout
//     res.stderr = cp.stderr
//
//     return res
//   }
//
//   /**
//    * Expect the command passed as @param arguments to fail.
//    * @return {Promise} Resolves if the command passed as @param arguments fails,
//    *                    rejects if it was successful.
//    */
//   ipfs.fail = function ipfsFail () {
//     let args = Array.from(arguments)
//     let caught = false
//     if (args.length === 1) {
//       args = args[0].split(' ')
//     }
//
//     return exec(args)
//       .catch(err => {
//         caught = true
//         expect(err).to.exist()
//       })
//       .then(() => {
//         if (!caught) {
//           throw new Error(`jsipfs expected to fail during command: jsipfs ${args.join(' ')}`)
//         }
//       })
//   }
//
//   return ipfs
// }
