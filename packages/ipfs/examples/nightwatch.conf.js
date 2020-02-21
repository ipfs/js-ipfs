'use strict'

const { ephemeralPort } = require('./utils')

const WEBRIVER_PORT = ephemeralPort()

// config used to test examples
module.exports = {
  src_folders: ['tests'],

  webdriver: {
    start_process: true,
    server_path: 'node_modules/.bin/chromedriver',
    port: WEBRIVER_PORT,
    cli_args: [
      `--port=${WEBRIVER_PORT}`
    ]
  },

  test_settings: {
    default: {
      desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
          args: ['headless']
        }
      }
    }
  },

  globals: {
    asyncHookTimeout: 120000,
    waitForConditionTimeout: 60000
  }
}
