'use strict'

const yargs = require('yargs')
const utils = require('../../src/cli/utils')
// const debug = require('debug')('jsipfs:ipfs-exec')
const D = require('debug')
const stream = require('stream')
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
const makeCLICall = (args) => {
  const outputStream = new stream.PassThrough()
  let argv = args.split(' ')
  // cat, add, get are aliases to `files *`
  let cliToLoad = argv[0]
  if (['cat', 'add', 'get'].includes(argv[0])) {
    cliToLoad = 'files/' + argv[0]
    // argv = ['files'].concat(argv)
  }
  if (argv[0] === '--pass') {
    console.log('Using global --pass siwtch')
    cliToLoad = argv[2]
  }
  if (argv[0] === 'help') {
    cliToLoad = 'commands'
  }
  // Load the actual source for the command
  const cliFullpath = '../../src/cli/commands/' + cliToLoad
  let cli = require(cliFullpath)
  const debug = D('jsipfs:ipfs-exec:' + cli.command)
  debug('Running', argv)
  debug('Required', cliFullpath)

  // Some commands use different ways of the description...
  const description = cli.describe || cli.description || ''

  // Load the parser for the command
  const parser = yargs.command(cli.command, description, cli.builder, cli.handler)
    .strict(false)
    .skipValidation('key')
    .skipValidation('value')

  debug('Parsed command')

  const res = new Promise((resolve, reject) => {
    // return new Promise((resolve, reject) => {
    // Save output we receive so we can return it
    let output = []
    // Placeholder callback for cleanup. Should be replaced with a proper one
    // later on
    let cleanup = (cb) => {
      debug('WARNING: placeholder cleanup called...')
      cb()
    }
    // Make sure onComplete only gets called once
    let onCompleteWasCalled = false
    // This callback gets injected into the CLI commands who can call it when
    // they are done with their operations
    const onComplete = (err) => {
      // Disable rest of function if already called before
      if (onCompleteWasCalled) {
        // Tracing to figure out where it comes from, it should not happen
        console.trace()
        console.log('onComplete was called a second time...')
        return
      }
      onCompleteWasCalled = true
      if (err) return reject(err)
      debug('onComplete called')
      outputStream.push(null)
      // Make sure we cleanup once we're done
      cleanup((err) => {
        if (err) return reject(err)
        debug('cleanup done, resolving value:', JSON.stringify(output.join('')))
        // Lets wait a bit for the shutdown to actually finish
        // TODO race-condition somewhere in shutdown, and it returns before
        // actually finishing, that's why we have the wait
        const timeout = argv[0] === 'shutdown' ? 100 : 0
        setTimeout(() => {
          resolve(output.join(''))
        }, timeout)
      })
    }

    // Create stream for injection to get stdout
    const writeable = new stream.Writable({
      write: function (chunk, encoding, next) {
        debug('received a little chunk', JSON.stringify(chunk.toString()))
        outputStream.push(chunk)
        output.push(chunk.toString())
        // TODO shitty implementation, should call onComplete when daemon/shutdown
        // commands finish, but without having to rely on stdout
        if (chunk.toString() === 'Daemon is ready\n' || chunk.toString() === 'Shutdown complete\n') {
          debug('received either daemon is ready or shutdown complete, so calling onComplete()')
          onComplete()
          this.destroy()
          // TODO probably this that leads to shitty stuff...
          utils.setPrintStream(process.stdout)
        }
        next()
      }
    })
    utils.setPrintStream(writeable)

    // init works differently from other commands, as we don't care about having
    // a daemon running when running it
    if (argv[0] === 'init') {
      debug('Init called, getting IPFS')
      utils.getIPFS({api: false}, (err, ipfs, _cleanup) => {
        if (err) throw err
        ipfs.once('init', () => {
          debug('Got init event, time to cleanup')
          // Bind to localhost and random port
          ipfs.config.set('Addresses.Swarm', [
            '/ip4/127.0.0.1/tcp/0'
          ], () => {
            cleanup = _cleanup
            onComplete()
          })
        })
        debug('Got IPFS node, initting')
        ipfs.init({bits: 512})
      })
    } else {
      debug('Parsing argv')
      yargs().option('api').strict(false).parse(argv, (err, getIPFSArgs, initialParseOutput) => {
        if (err) throw err
        const isDaemonCmd = argv[0] === 'daemon'
        // If it's daemon command, we should set the multiaddr for api
        const api = isDaemonCmd ? '/ip4/127.0.0.1/tcp/5002' : false
        debug('Getting IPFS')
        utils.getIPFS(Object.assign(getIPFSArgs, {api}), (err, ipfs, _cleanup) => {
          if (err) return reject(err)
          cleanup = _cleanup.bind(this)
          try {
            debug('Actually make the call')
            parser.parse(argv, {
              ipfs: ipfs,
              onComplete: isDaemonCmd ? function () {} : onComplete,
              stdoutStream: writeable,
              printer: (msg, newline) => {
                if (newline === undefined) {
                  newline = true
                }

                if (msg === undefined) {
                  msg = ''
                }
                msg = newline ? msg + '\n' : msg
                writeable.write(msg)
              }
            }, (err, argv, _output) => {
              if (_output) {
                _output.split('\n').forEach(line => output.push(line))
              }
              if (err) return reject(err)
              // cleanup(() => {})
              debug('Callback called, waiting for onComplete')
              // onComplete()
              // no need to do anything after the command because we have onComplete
            })
          } catch (err) {
            debug('Got error', err)
            cleanup(() => onComplete(err))
          }
        })
      })
    }
  })
  res.stdout = outputStream
  return res
}

module.exports = function ipfsExec (repoPath) {
  process.env.IPFS_PATH = repoPath

  const ipfsExec = function (args) {
    return makeCLICall(args)
  }
  ipfsExec.repoPath = repoPath
  ipfsExec.fail = (args) => {
    return new Promise((resolve, reject) => {
      // Reverse resolve/reject as we want the command to fail here
      return makeCLICall(args).then(reject).catch(resolve)
    })
  }
  return ipfsExec
}
