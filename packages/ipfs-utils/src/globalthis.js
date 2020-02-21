/* eslint-disable no-undef */
/* eslint-disable no-extend-native */
/* eslint-disable strict */

// polyfill for globalThis
// https://v8.dev/features/globalthis
// https://mathiasbynens.be/notes/globalthis
(function () {
  if (typeof globalThis === 'object') return
  Object.defineProperty(Object.prototype, '__magic__', {
    get: function () {
      return this
    },
    configurable: true
  })
  __magic__.globalThis = __magic__
  delete Object.prototype.__magic__
}())

module.exports = globalThis
