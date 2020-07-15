'use strict'

const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const config = require('./webpack.config')

const wds = new WebpackDevServer(webpack(config), {
  hot: true,
  historyApiFallback: true
})

wds.listen(8888, 'localhost', (err) => {
  if (err) {
    throw err
  }

  console.log('Listening at localhost:8888')
})
