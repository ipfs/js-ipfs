import os from 'os'
import parseDuration from 'parse-duration'

export default {
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
      describe: 'Include the version\'s commit hash'
    },
    repo: {
      type: 'boolean',
      default: false,
      describe: 'Print only the repo\'s version number'
    },
    all: {
      type: 'boolean',
      default: false,
      describe: 'Print everything we have'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   * @param {boolean} argv.all
   * @param {boolean} argv.commit
   * @param {boolean} argv.repo
   * @param {boolean} argv.number
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { print, ipfs }, all, commit, repo, number, timeout }) {
    const data = await ipfs.version({
      timeout
    })

    const withCommit = all || commit
    const parsedVersion = `${data.version}${withCommit && data.commit ? `-${data.commit}` : ''}`

    if (repo) {
      // go-ipfs prints only the number, even without the --number flag.
      // @ts-ignore version return type is implementation-specific
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
