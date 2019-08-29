exports.sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

exports.Logger = outEl => {
  outEl.innerHTML = ''
  return message => {
    const container = document.createElement('div')
    container.innerHTML = message
    outEl.appendChild(container)
    outEl.scrollTop = outEl.scrollHeight
  }
}

exports.onEnterPress = fn => {
  return e => {
    if (event.which == 13 || event.keyCode == 13) {
      e.preventDefault()
      fn()
    }
  }
}

exports.catchAndLog = (fn, log) => {
  return async (...args) => {
    try {
      await fn(...args)
    } catch (err) {
      console.error(err)
      log(`<span class="red">${err.message}</span>`)
    }
  }
}
