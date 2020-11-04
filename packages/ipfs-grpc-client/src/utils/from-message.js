'use strict'

const rename = ['List', 'Map']

// uff https://github.com/protocolbuffers/protobuf/issues/6773
module.exports = (object) => {
  const output = {}

  Object.keys(object)
    .forEach(key => {
      let value = object[key]

      rename.forEach(suffix => {
        if (key.endsWith(suffix)) {
          key = key.substring(0, key.length - suffix.length)
        }
      })

      output[key] = value
    })

  return output
}
