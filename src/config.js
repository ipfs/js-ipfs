var pkg = require('../package.json')

exports = module.exports = function getConfig () {
  return {
    'api-path': '/api/v0/',
    'user-agent': '/node-' + pkg.name + '/' + pkg.version + '/',
    'host': 'localhost',
    'port': '5001'
  }
}
