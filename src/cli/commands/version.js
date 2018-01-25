'use strict'

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
    argv.ipfs.version((err, ipfs) => {
      if (err) {
        throw err
      }

      const withCommit = argv.all || argv.commit
      const parsedVersion = `${ipfs.version}${withCommit ? `-${ipfs.commit}` : ''}`

      if (argv.repo) {
        // go-ipfs prints only the number, even without the --number flag.
        print(ipfs.repo)
      } else if (argv.number) {
        print(parsedVersion)
      } else if (argv.all) {
        print(`js-ipfs version: ${parsedVersion}`)
        print(`Repo version: ${ipfs.repo}`)
      } else {
        print(`js-ipfs version: ${parsedVersion}`)
      }
    })
  }
}
