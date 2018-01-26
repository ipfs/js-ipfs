'use strict'

const os = require('os')
const print = require('../utils').print

module.exports = {
  command: 'version',

  describe: 'Shows IPFS version information',

  builder: {
    number: {
      alias: 'n',
      type: 'boolean',
      default: false,
      describe: 'Print only the version number'
    },
    commit: {
      type: 'boolean',
      default: false,
      describe: `Include the version's commit hash`
    },
    repo: {
      type: 'boolean',
      default: false,
      describe: `Print only the repo's version number`
    },
    all: {
      type: 'boolean',
      default: false,
      describe: 'Print everything we have'
    }
  },

  handler (argv) {
    argv.ipfs.version((err, data) => {
      if (err) {
        throw err
      }

      const withCommit = argv.all || argv.commit
      const parsedVersion = `${data.version}${withCommit ? `-${data.commit}` : ''}`

      if (argv.repo) {
        // go-ipfs prints only the number, even without the --number flag.
        print(data.repo)
      } else if (argv.number) {
        print(parsedVersion)
      } else if (argv.all) {
        print(`js-ipfs version: ${parsedVersion}`)
        print(`Repo version: ${data.repo}`)
        print(`System version: ${os.arch()}/${os.platform()}`)
        print(`Node.js version: ${process.version}`)
      } else {
        print(`js-ipfs version: ${parsedVersion}`)
      }
    })
  }
}
