/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const through = require('through2')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const getStream = require('get-stream')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.getReadableStream', function () {
    this.timeout(60 * 1000)

    let ipfs

    before(async () => {
      ipfs = await common.setup()
      await ipfs.add(fixtures.smallFile.data)
    })

    after(() => common.teardown())

    it('should return a Readable Stream of Readable Streams', async () => {
      const stream = ipfs.getReadableStream(fixtures.smallFile.cid)

      // I was not able to use 'get-stream' module here
      // as it exceeds the timeout. I think it might be related
      // to 'pump' module that get-stream uses
      const files = await new Promise((resolve, reject) => {
        const filesArr = []
        stream.pipe(through.obj(async (file, enc, next) => {
          const content = await getStream.buffer(file.content)
          filesArr.push({ path: file.path, content: content })
          next()
        }, () => resolve(filesArr)))
      })

      expect(files).to.be.length(1)
      expect(files[0].path).to.eql(fixtures.smallFile.cid)
      expect(files[0].content.toString()).to.contain('Plz add me!')
    })
  })
}
