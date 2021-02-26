'use strict'

const { AbortController } = require('native-abort-controller')

class SubscriptionTracker {
  constructor () {
    this._subs = new Map()
  }

  static singleton () {
    if (SubscriptionTracker.instance) return SubscriptionTracker.instance
    SubscriptionTracker.instance = new SubscriptionTracker()
    return SubscriptionTracker.instance
  }

  subscribe (topic, handler, signal) {
    const topicSubs = this._subs.get(topic) || []

    if (topicSubs.find(s => s.handler === handler)) {
      throw new Error(`Already subscribed to ${topic} with this handler`)
    }

    // Create controller so a call to unsubscribe can cancel the request
    const controller = new AbortController()

    this._subs.set(topic, [{ handler, controller }].concat(topicSubs))

    // If there is an external signal, forward the abort event
    if (signal) {
      signal.addEventListener('abort', () => this.unsubscribe(topic, handler))
    }

    return controller.signal
  }

  unsubscribe (topic, handler) {
    const subs = this._subs.get(topic) || []
    let unsubs

    if (handler) {
      this._subs.set(topic, subs.filter(s => s.handler !== handler))
      unsubs = subs.filter(s => s.handler === handler)
    } else {
      this._subs.set(topic, [])
      unsubs = subs
    }

    unsubs.forEach(s => s.controller.abort())
  }
}

SubscriptionTracker.instance = null

module.exports = SubscriptionTracker
