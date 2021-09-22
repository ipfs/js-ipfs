
export class TimeoutError extends Error {
  constructor (message = 'request timed out') {
    super(message)
    this.name = 'TimeoutError'
    this.code = TimeoutError.code
  }
}

TimeoutError.code = 'ERR_TIMEOUT'
