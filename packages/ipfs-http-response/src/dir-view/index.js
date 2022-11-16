import { filesize } from 'filesize'
import style from './style.js'
import { cidArray } from '../utils/path.js'
import ejs from 'ejs'

/**
 * @param {string} path
 */
function getParentHref (path) {
  const parts = cidArray(path).slice()
  if (parts.length > 1) {
    // drop the last segment in a safe way that works for both paths and urls
    return path.replace(`/${parts.pop()}`, '')
  }
  return path
}

/**
 * @param {string} path
 * @param {({ Name: string, Tsize: number })[]} links
 */
export function render (path, links) {
  return ejs.render(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title><%= path %></title>
  <style>${style}</style>
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
        <strong>Index of <%= path %></strong>
      </div>
      <table class="table table-striped">
        <tbody>
          <tr>
            <td class="narrow">
              <div class="ipfs-icon ipfs-_blank">&nbsp;</div>
            </td>
            <td class="padding">
              <a href="<%= parentHref %>">..</a>
            </td>
            <td></td>
          </tr>
          <% links.forEach(function (link) { %>
          <tr>
            <td><div class="ipfs-icon ipfs-_blank">&nbsp;</div></td>
            <td><a href="<%= link.link %>"><%= link.name %></a></t>
            <td><%= link.size %></td>
          </td>
          </tr>
          <% }) %>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
`, {
    path,
    links: links.map((link) => ({
      name: link.Name,
      size: filesize(link.Tsize),
      link: `${path}${path.endsWith('/') ? '' : '/'}${link.Name}`
    })),
    parentHref: getParentHref(path)
  })
}
