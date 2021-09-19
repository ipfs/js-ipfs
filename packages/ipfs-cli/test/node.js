/* eslint-env mocha */


import fs from 'fs'

describe('cli', () => {
  fs.readdirSync(__dirname)
    .filter((file) => file !== 'node.js' && file !== 'utils')
    .forEach((file) => require('./' + file))
})
