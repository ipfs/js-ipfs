// Note: Needed until following issue is resolved
// https://github.com/jacobheun/timeout-abort-controller/pull/4 
declare class TimeoutController extends AbortController {
  /**
   * @constructor
   * @param {number} ms milliseconds
   */
  constructor (ms:number)
  /**
   * Aborts the controller and clears the timer
   */
  abort ():void
  /**
   * Clears the timer
   */
  clear ():void
  /**
   * Resets the timer
   */
  reset ():void
}

declare namespace TimeoutController {
  export { TimeoutController }
}

export = TimeoutController
