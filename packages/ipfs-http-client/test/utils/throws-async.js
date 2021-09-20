
export async function throwsAsync (fnOrPromise) {
  try {
    await (fnOrPromise.then ? fnOrPromise : fnOrPromise())
  } catch (/** @type {any} */ err) {
    return err
  }
  throw new Error('did not throw')
}
