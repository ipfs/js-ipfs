const expect = require('chai').expect
const hat = require('hat')
const os = require('os')
const utils = require('./src/cli/utils')

const useNew = false

if (!useNew) {
  const ipfsExec = require('./test/utils/ipfs-exec')

  const thing = {}
  const repoPath = os.tmpdir() + '/ipfs-' + hat()
  thing.ipfs = ipfsExec(repoPath)
  thing.ipfs.repoPath = repoPath
  thing.ipfs('init').then(() => {
    return thing.ipfs('files add src/init-files/init-docs/readme --cid-version=1')
  }).then((out) => {
    console.log('Not supposed to be here')
  }).catch(() => {
    console.log('Everything OK')
  })
  // thing.ipfs('init').then(() => {
  //   thing.ipfs('daemon').then(() => {
  //     return thing.ipfs('block put test/fixtures/test-data/no-newline')
  //   }).then((out) => {
  //     expect(out).to.eql('QmTwbQs4sGcCiPxV97SpbHS7QgmVg9SiKxcG1AcF1Ly2SL\n')
  //     return thing.ipfs('block get QmTwbQs4sGcCiPxV97SpbHS7QgmVg9SiKxcG1AcF1Ly2SL')
  //   }).then((out) => {
  //     expect(out).to.eql('there is no newline at end of this file')
  //     return thing.ipfs('shutdown')
  //   }).then(() => {
  //     console.log('Now were donie, lets do it again')
  //     return thing.ipfs('daemon')
  //   }).then(() => {
  //     return thing.ipfs('block put test/fixtures/test-data/no-newline')
  //   }).then((out) => {
  //     expect(out).to.eql('QmTwbQs4sGcCiPxV97SpbHS7QgmVg9SiKxcG1AcF1Ly2SL\n')
  //     return thing.ipfs('block get QmTwbQs4sGcCiPxV97SpbHS7QgmVg9SiKxcG1AcF1Ly2SL')
  //   }).then((out) => {
  //     expect(out).to.eql('there is no newline at end of this file')
  //     return thing.ipfs('shutdown')
  //   }).then(() => {
  //     console.log('Now were donie')
  //   })
  //     // thing.ipfs('files add src/init-files/init-docs/readme')
  //     // th.then((out) => {
  //     // th  expect(out)
  //     // th    .to.eql('added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme\n')
  //     // th  console.log('All goodie!')
  //     // th  thing.ipfs('shutdown')
  //     // th})
  //   // })// th
  // })
} else {
  const yargs = require('yargs')

  const ipfsExec = (repoPath) => {
    process.env.IPFS_PATH = repoPath

    return function (args) {
      const argv = args.split(' ')
      // console.log('argv', argv)
      const cliToLoad = argv[0]
      let cli = require('./src/cli/commands/' + cliToLoad)

      const description = cli.describe || cli.description || ''
      const parser = yargs.command(cli.command, description, cli.builder, cli.handler)
      return new Promise((resolve, reject) => {
        let output = []
        const onComplete = (err) => {
          if (err) return reject(err)
          resolve(output.join('\n'))
        }
        // console.log('parsing')
        if (argv[0] === 'daemon' || argv[0] === 'init') {
          utils.getIPFS({api: false}, (err, ipfs, _cleanup) => {
            if (err) throw err
            ipfs.once('init', () => {
              _cleanup(resolve)
            })
            ipfs.init()
          })
        } else {
          var stream = require('stream')
          var writable = new stream.Writable({
            write: function (chunk, encoding, next) {
              output.push(chunk.toString())
              next()
            }
          })
          utils.setPrintStream(writable)

          yargs().option('api').parse(argv, (err, getIPFSArgs, output) => {
            if (err) throw err
            utils.getIPFS(getIPFSArgs, (err, ipfs, _cleanup) => {
              if (err) throw err
              parser.parse(argv, {ipfs, onComplete}, (err, argv, _output) => {
                if (err) return reject(err)
              })
            })
          })
        }
      })
    }
  }

  const repoPath = os.tmpdir() + '/ipfs-' + hat()
  const ipfs = ipfsExec(repoPath)
  console.log('## Before init')
  ipfs('init').then(() => {
    console.log('## After init, before files add')
    return ipfs('files add src/init-files/init-docs/readme')
  }).then((out) => {
    console.log('## After files add')
    expect(out)
      .to.eql('added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme\n')
    console.log('All goodie!')
  }).catch((err) => {
    console.log(err)
  })
}
