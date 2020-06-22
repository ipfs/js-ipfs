'use strict'

const modalScreen = document.getElementById('modal-screen')

modalScreen.onclick = (event) => {
  if (event.target === modalScreen) {
    hideForms()
  }
}

const forms = {
  mkdir: document.getElementById('form-mkdir'),
  mv: document.getElementById('form-mv'),
  cp: document.getElementById('form-cp'),
  rm: document.getElementById('form-rm'),
  stat: document.getElementById('form-stat'),
  read: document.getElementById('form-read')
}

const getValue = (id) => {
  const element = document.getElementById(id)

  if (element.type === 'checkbox') {
    return Boolean(element.checked)
  }

  if (element.type === 'number') {
    const result = parseInt(element.value.trim())

    return isNaN(result) ? undefined : result
  }

  return element.value.trim()
}

const hideForms = () => {
  modalScreen.style.display = 'none'

  Object.values(forms)
    .forEach(form => {
      form.style.display = 'none'
    })
}

const showForm = (form) => {
  return (event) => {
    event.preventDefault()

    modalScreen.style.display = 'block'
    form.style.display = 'block'
  }
}

const mkdirForm = (onMkdir) => {
  const button = document.getElementById('button-mkdir')
  const submit = document.getElementById('button-form-mkdir-submit')

  button.onclick = showForm(forms.mkdir)
  submit.onclick = () => {
    hideForms()

    onMkdir(
      getValue('form-mkdir-path'),
      getValue('form-mkdir-parents'),
      getValue('form-mkdir-format'),
      getValue('form-mkdir-hashalg'),
      getValue('form-mkdir-flush')
    )
  }

  button.disabled = false
}

const mvForm = (onMv) => {
  const button = document.getElementById('button-mv')
  const submit = document.getElementById('button-form-mv-submit')

  button.onclick = showForm(forms.mv)
  submit.onclick = () => {
    hideForms()

    onMv(
      [getValue('form-mv-path')],
      getValue('form-mv-dest'),
      getValue('form-mv-parents'),
      getValue('form-mv-format'),
      getValue('form-mv-hashalg'),
      getValue('form-mv-flush')
    )
  }

  button.disabled = false
}

const cpForm = (onCp) => {
  const button = document.getElementById('button-cp')
  const submit = document.getElementById('button-form-cp-submit')

  button.onclick = showForm(forms.cp)
  submit.onclick = () => {
    hideForms()

    onCp(
      [getValue('form-cp-path')],
      getValue('form-cp-dest'),
      getValue('form-cp-parents'),
      getValue('form-cp-format'),
      getValue('form-cp-hashalg'),
      getValue('form-cp-flush')
    )
  }

  button.disabled = false
}

const rmForm = (onRm) => {
  const button = document.getElementById('button-rm')
  const submit = document.getElementById('button-form-rm-submit')

  button.onclick = showForm(forms.rm)
  submit.onclick = () => {
    hideForms()

    onRm(
      [getValue('form-rm-path')],
      getValue('form-rm-recursive')
    )
  }

  button.disabled = false
}

const statForm = (onStat) => {
  const button = document.getElementById('button-stat')
  const submit = document.getElementById('button-form-stat-submit')

  button.onclick = showForm(forms.stat)
  submit.onclick = () => {
    hideForms()

    onStat(
      getValue('form-stat-path'),
      getValue('form-stat-hash'),
      getValue('form-stat-size'),
      getValue('form-stat-withlocal')
    )
  }

  button.disabled = false
}

const readForm = (onRead) => {
  const button = document.getElementById('button-read')
  const submit = document.getElementById('button-form-read-submit')

  button.onclick = showForm(forms.read)
  submit.onclick = () => {
    hideForms()

    onRead(
      getValue('form-read-path'),
      getValue('form-read-offset'),
      getValue('form-read-length')
    )
  }

  button.disabled = false
}

module.exports = {
  mkdirForm,
  mvForm,
  rmForm,
  cpForm,
  statForm,
  readForm,
  hideForms
}
