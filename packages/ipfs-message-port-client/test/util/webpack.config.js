'use strict'

const path = require('path')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: [path.join(__dirname, './worker.js')],
  output: {
    path: __dirname,
    filename: 'worker.bundle.js'
  }
}
