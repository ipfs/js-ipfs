'use strict'

process.on('unhandledPromiseRejection', (err) => {
  throw err
})

// config used to test examples
module.exports = {
  src_folders: ['tests'],

  webdriver: {
    start_process: true,
    server_path: 'node_modules/.bin/chromedriver',
    port: 9515
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
