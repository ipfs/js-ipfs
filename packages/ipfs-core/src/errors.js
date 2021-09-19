
export class NotInitializedError extends Error {
  constructor (message = 'not initialized') {
    super(message)
    this.name = 'NotInitializedError'
    this.code = NotInitializedError.code
  }
}
NotInitializedError.code = 'ERR_NOT_INITIALIZED'

export class AlreadyInitializingError extends Error {
  constructor (message = 'cannot initialize an initializing node') {
    super(message)
    this.name = 'AlreadyInitializingError'
    this.code = AlreadyInitializedError.code
  }
}
AlreadyInitializingError.code = 'ERR_ALREADY_INITIALIZING'

export class AlreadyInitializedError extends Error {
  constructor (message = 'cannot re-initialize an initialized node') {
    super(message)
    this.name = 'AlreadyInitializedError'
    this.code = AlreadyInitializedError.code
  }
}
AlreadyInitializedError.code = 'ERR_ALREADY_INITIALIZED'

export class NotStartedError extends Error {
  constructor (message = 'not started') {
    super(message)
    this.name = 'NotStartedError'
    this.code = NotStartedError.code
  }
}
NotStartedError.code = 'ERR_NOT_STARTED'

export class AlreadyStartingError extends Error {
  constructor (message = 'cannot start, already startin') {
    super(message)
    this.name = 'AlreadyStartingError'
    this.code = AlreadyStartingError.code
  }
}
AlreadyStartingError.code = 'ERR_ALREADY_STARTING'

export class AlreadyStartedError extends Error {
  constructor (message = 'cannot start, already started') {
    super(message)
    this.name = 'AlreadyStartedError'
    this.code = AlreadyStartedError.code
  }
}
AlreadyStartedError.code = 'ERR_ALREADY_STARTED'

export class NotEnabledError extends Error {
  constructor (message = 'not enabled') {
    super(message)
    this.name = 'NotEnabledError'
    this.code = NotEnabledError.code
  }
}
NotEnabledError.code = 'ERR_NOT_ENABLED'
