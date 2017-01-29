// Read contents of a File (TODO: link to MDN) and
// return the contents as an ArrayBuffer
export function readFileContents (file, callback) {
  const reader = new FileReader()
  reader.onload = (event) => callback(null, event.target.result)
  reader.readAsArrayBuffer(file)
}
