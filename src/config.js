var pkg = require('../package.json')

exports = module.exports = {
  'api-path': '/api/v0/',
  'user-agent': '/node-' + pkg.name + '/' + pkg.version + '/',
  'host': 'localhost',
  'port': '5001'
}
