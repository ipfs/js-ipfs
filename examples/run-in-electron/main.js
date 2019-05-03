'use strict'

const { app, BrowserWindow } = require('electron')

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({ width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    } })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  createWindow()

  const IPFS = require('ipfs')
  const node = new IPFS()
  node.on('ready', () => {
    node.id((err, id) => {
      if (err) {
        return console.log(err)
      }
      console.log(id)
    })
  })
  node.on('error', (err) => {
    return console.log(err)
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit() }
})

app.on('activate', () => {
  if (mainWindow === null) { createWindow() }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
