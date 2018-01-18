'use strict'

const print = require('../utils').print

module.exports = {
  command: 'version',

  describe: 'Shows IPFS version information',

  builder: {
    number: {
      alias: 'n',
      type: 'boolean',
      default: false
    },
    commit: {
      type: 'boolean',
      default: false
    },
    repo: {
      type: 'boolean',
      default: false
    }
  },

  handler (argv) {
    // TODO: handle argv.{repo|commit|number}
    // cmdkit.BoolOption("number", "n", "Only show the version number.")
		// cmdkit.BoolOption("commit", "Show the commit hash.")
		// cmdkit.BoolOption("repo", "Show repo version.")

    // const ipfsModule = argv.repo ? argv.ipfs.repo : argv.ipfs.
    if (argv.repo) {
      argv.ipfs.repo.version(function (err, version) {
        if (err) {
          throw err
        }

        print(`ipfs-repo version: ${version.version}`)
      })
    } else {
      argv.ipfs.version((err, version) => {
        if (err) {
          throw err
        }

        console.log('verison:', version)

        print(`js-ipfs version: ${version.version}`)
      })
    }

  }
}
