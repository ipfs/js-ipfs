/**
 * Error raised when there is lock already in place when repo is being opened.
 */
export declare class LockExistsError extends Error {
  name: 'LockExistsError'
  code: 'ERR_LOCK_EXISTS'
  static code: 'ERR_LOCK_EXISTS'
}

/**
 * Error raised when requested item is not found.
 */
export declare class NotFoundError extends Error {
  name: 'NotFoundError'
  code: 'ERR_NOT_FOUND'
  static code: 'ERR_NOT_FOUND'
}

/**
 * Error raised when version of the stored repo is not compatible with version of this package.
 */
export declare class InvalidRepoVersionError extends Error {
  name: 'InvalidRepoVersionError'
  code: 'ERR_INVALID_REPO_VERSION'
  static code: 'ERR_INVALID_REPO_VERSION'
}

export var ERR_REPO_ALREADY_OPEN:"ERR_REPO_ALREADY_OPEN"
export var ERR_REPO_NOT_INITIALIZED:'ERR_REPO_NOT_INITIALIZED'
export var ERR_REPO_ALREADY_CLOSED:"ERR_REPO_ALREADY_CLOSED"