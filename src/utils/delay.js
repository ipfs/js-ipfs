'use strict'

/**
 * Promise version of setTimeout
 * @example
 * ```js
 * async function something() {
 *     console.log("this might take some time....");
 *     await delay(5000);
 *     console.log("done!")
 * }
 *
 * something();
 * ```
 * @param {number} ms
 * @return {Promise}
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = delay
