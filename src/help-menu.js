module.exports = function help () {
  var help = ['Usage: ' + this.programName + ' ' + this.name + ' [OPTIONS]']
  help.push('\n\nOPTIONS:\n\n')
  var options = this.options
  Object.keys(options).forEach(function (key) {
    var line = '  '
    line = line + '-' + options[key].alias + ', --' + key + '\t'
    line = line + options[key].type + '\t'
    line = line + '- ' + options[key].desc
    help.push(line + '\n')
  })

  return help
}
