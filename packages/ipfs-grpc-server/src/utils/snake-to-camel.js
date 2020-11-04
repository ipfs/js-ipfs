'use strict'

module.exports = (string) => {
  return string.split('_')
    .map((str, index) => {
      if (index === 0) {
        return str
      }

      return str.substring(0, 1).toUpperCase() + str.substring(1)
    })
    .join('')
}
