'use strict'

const filesize = require('filesize')

const mainStyle = require('./style')
const pathUtil = require('../utils/path')

function getParentDirectoryURL (originalParts) {
  const parts = originalParts.slice()

  if (parts.length > 1) {
    parts.pop()
  }

  return [ '', 'ipfs' ].concat(parts).join('/')
}

function buildFilesList (path, links) {
  const rows = links.map((link) => {
    let row = [
      `<div class="ipfs-icon ipfs-_blank">&nbsp;</div>`,
      `<a href="${pathUtil.joinURLParts(path, link.name)}">${link.name}</a>`,
      filesize(link.size)
    ]

    row = row.map((cell) => `<td>${cell}</td>`).join('')

    return `<tr>${row}</tr>`
  })

  return rows.join('')
}

function buildTable (path, links) {
  const parts = pathUtil.splitPath(path)
  const parentDirectoryURL = getParentDirectoryURL(parts)

  return `
    <table class="table table-striped">
      <tbody>
        <tr>
          <td class="narrow">
            <div class="ipfs-icon ipfs-_blank">&nbsp;</div>
          </td>
          <td class="padding">
            <a href="${parentDirectoryURL}">..</a>
          </td>
          <td></td>
        </tr>
        ${buildFilesList(path, links)}
      </tbody>
    </table>
  `
}

function render (path, links) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${path}</title>
      <style>${mainStyle}</style>
    </head>
    <body>
      <div id="header" class="row">
        <div class="col-xs-2">
          <div id="logo" class="ipfs-logo"></div>
        </div>
      </div>
      <br>
      <div class="col-xs-12">
        <div class="panel panel-default">
          <div class="panel-heading">
            <strong>Index of ${path}</strong>
          </div>
          ${buildTable(path, links)}
        </div>
      </div>
    </body>
    </html>
  `
}

exports = module.exports
exports.render = render
