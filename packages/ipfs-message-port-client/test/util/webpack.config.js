'use strict'

const path = require('path')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: [path.join(__dirname, './worker.js')],
  output: {
    path: path.join(__dirname, '../../dist/'),
    filename: 'worker.bundle.js'
  }
}
