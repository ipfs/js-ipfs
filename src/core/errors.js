const errCode = require('err-code')

exports.ERR_NOT_INITIALIZED = () => {
  throw errCode(new Error('not initialized'), 'ERR_NOT_INITIALIZED')
}

exports.ERR_ALREADY_INITIALIZING = () => {
  const msg = 'cannot initialize an initializing node'
  throw errCode(new Error(msg), 'ERR_ALREADY_INITIALIZING')
}

exports.ERR_ALREADY_INITIALIZED = () => {
  const msg = 'cannot re-initialize an initialized node'
  throw errCode(new Error(msg), 'ERR_ALREADY_INITIALIZED')
}

exports.ERR_NOT_STARTED = () => {
  throw errCode(new Error('not started'), 'ERR_NOT_STARTED')
}
