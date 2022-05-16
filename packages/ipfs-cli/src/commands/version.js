import os from 'os'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../types').Context} Argv.ctx
 * @property {boolean} Argv.all
 * @property {boolean} Argv.commit
 * @property {boolean} Argv.repo
 * @property {boolean} Argv.number
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'version',

  describe: 'Shows IPFS version information',

  builder: {
    number: {
      alias: 'n',
      boolean: true,
      default: false,
      describe: 'Print only the version number'
    },
    commit: {
      boolean: true,
      default: false,
      describe: 'Include the version\'s commit hash'
    },
    repo: {
      boolean: true,
      default: false,
      describe: 'Print only the repo\'s version number'
    },
    all: {
      boolean: true,
      default: false,
      describe: 'Print everything we have'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { print, ipfs }, all, commit, repo, number, timeout }) {
    const data = await ipfs.version({
      timeout
    })

    const withCommit = all || commit
    const parsedVersion = `${data.version}${withCommit && data.commit ? `-${data.commit}` : ''}`

    if (repo) {
      // go-ipfs prints only the number, even without the --number flag.
      // @ts-expect-error version return type is implementation-specific
      print(data.repo)
    } else if (number) {
      print(parsedVersion)
    } else if (all) {
      print(`js-ipfs version: ${parsedVersion}`)
      print(`interface-ipfs-core version: ${data['interface-ipfs-core']}`)
      print(`ipfs-http-client version: ${data['ipfs-http-client']}`)
      print(`Repo version: ${data.repo}`)
      print(`System version: ${os.arch()}/${os.platform()}`)
      print(`Node.js version: ${process.version}`)

      if (data.commit) {
        print(`Commit: ${data.commit}`)
      }
    } else {
      print(`js-ipfs version: ${parsedVersion}`)
    }
  }
}

export default command
