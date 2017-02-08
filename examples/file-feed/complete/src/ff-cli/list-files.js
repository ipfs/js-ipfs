'use strict'

module.exports = function list (db) {
  const latest = db.iterator({ limit: -1 }).collect()
  const files = latest.reverse().map((e) => {
    return e.payload.value.file.path + ' | ' +
      e.payload.value.file.hash + ' | ' +
      e.payload.value.file.size + ' | ' +
      e.payload.value.mime
  })

  let output = ''
  if (latest.length > 0) {
    output = `\n${db.dbname}:\n`
    output += `------------------------------\n`
    output += `File | Hash | Size | Mime Type\n`
    output += `------------------------------\n`
    output += files.join('\n') + '\n'
    output += `------------------------------\n`
  } else {
    output = (`\n${db.dbname} is empty\n`)
  }

  console.log(output)
}
