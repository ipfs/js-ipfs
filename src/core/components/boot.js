'use strict'

module.exports = (self) => () => {
  return new Promise((resolve, reject) => {
    /*
      Refactor the `src/core/boot.js` in order to return a promise.
      This way the error propagation will be made using promises/callbacks
      and so, event emitters will not be necessary.
    */
    resolve(self)
  })
}
