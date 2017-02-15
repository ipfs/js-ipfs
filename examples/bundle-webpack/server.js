'use strict'

const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const config = require('./webpack.config')

const wds = new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true
})

wds.listen(3000, 'localhost', (err, result) => {
  if (err) {
    throw err
  }

  console.log('Listening at localhost:3000')
})
