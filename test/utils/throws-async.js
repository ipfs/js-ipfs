'use strict'

module.exports = async fnOrPromise => {
  try {
    await (fnOrPromise.then ? fnOrPromise : fnOrPromise())
  } catch (err) {
    return err
  }
  throw new Error('did not throw')
}
