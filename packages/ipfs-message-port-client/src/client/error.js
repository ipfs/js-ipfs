
export class TimeoutError extends Error {
  get name () {
    return this.constructor.name
  }
}

export class AbortError extends Error {
  get name () {
    return this.constructor.name
  }
}

export class DisconnectError extends Error {
  get name () {
    return this.constructor.name
  }
}
