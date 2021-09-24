import parseDuration from 'parse-duration'

export default {
  command: 'read <path>',

  describe: 'Read an mfs file',

  builder: {
    offset: {
      alias: 'o',
      type: 'number',
      describe: 'Start writing at this offset'
    },
    length: {
      alias: 'l',
      type: 'number',
      describe: 'Write only this number of bytes'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.path
   * @param {number} argv.offset
   * @param {number} argv.length
   * @param {number} argv.timeout
   */
  async handler ({
    ctx: { ipfs, print },
    path,
    offset,
    length,
    timeout
  }) {
    for await (const buffer of ipfs.files.read(path, {
      offset,
      length,
      timeout
    })) {
      print(buffer, false)
    }
  }
}
