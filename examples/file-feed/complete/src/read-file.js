// Read contents of a File (TODO: link to MDN) and
// return the contents as an ArrayBuffer
export function readFileContents (file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => resolve(event.target.result)
    reader.readAsArrayBuffer(file)
  })
}
