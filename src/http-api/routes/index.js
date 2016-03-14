module.exports = (server) => {
  require('./version')(server)
  require('./id')(server)
  require('./bootstrap')(server)
  // require('./block')(server)
  require('./object')(server)
  // require('./repo')(server)
  require('./config')(server)
}
