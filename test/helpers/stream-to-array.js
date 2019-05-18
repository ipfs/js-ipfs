'use strict'

module.exports = async (stream) => {
  const arr = []

  for await (const entry of stream) {
    arr.push(entry)
  }

  return arr
}
