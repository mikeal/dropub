/* globals self, postMessage, URL */
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js')

self.onmessage = (e) => {
  const data = e.data || {}
  if (e.data.type === 'compress') {
    compress(data)
  }
}

function compress (data) {
  const zip = new self.JSZip()

  data.files.forEach((file) => {
    zip.file(file.name, file.blob)
  })

  zip.generateAsync({
    type: 'blob'
  }).then(blob => {
    postMessage({
      type: 'compressed',
      name: 'download.zip',
      url: URL.createObjectURL(blob)
    })
  }).catch((error) => handleErrors(error, 'Could not ZIP audio files'))
}

function handleErrors (error, message) {
  postMessage({
    type: 'error',
    message,
    error
  })
}
