const funky = require('funky')
const bel = require('bel')
const emojione = require('emojione')
const elementClass = require('element-class')
const mime = require('browserify-mime')
const Clipboard = require('clipboard')
const notices = require('./dropub-notices')

const mojimap = {
  'audio/': '🎧',
  'video/': '📼',
  'image/': '🖼',
  'default': '💿'
}

const startsWith = (str, x) => str.indexOf(x) === 0

function fileEmoji (type) {
  for (var key in mojimap) {
    if (startsWith(type, key)) return mojimap[key]
  }
  return mojimap.default
}

function fileElement (f) {
  let type = mime.lookup(f.name)
  let progress = bel`<progress value=0></progress>`
  let el = bel`
  <div class="dropub-file">
    <div class="dropub-file-emoji">
      ${bel([emojione.unicodeToImage(fileEmoji(type))])}
    </div>
    <div class="dropub-filename">
      <div class="dropub-filename-label
                  dropub-not-downloaded"
       ><a>${f.name}</a></div>
      ${f.done ? '' : progress}
    </div>
  </div>
  `
  return el
}

function init (elem, opts) {
  let webtorrent = opts.webtorrent
  let torrent = opts.torrent

  const modal = bel`
  <div class="dropub-modal-background">
    <style>
    div.dropub-modal-container {
      height: 100vh;
      display: flex;
      justify-content: center;
      width:100%;
      align-items: center;
    }
    div.dropub-modal-container * {
      align-self: center;
    }
    </style>
    <div class="dropub-modal-container">
    </div>
  </div>
  `
  modal.onclick = () => {
    unblur()
    modalContainer.innerHTML = ''
    elem.removeChild(modal)
  }
  const modalContainer = modal.querySelector('div.dropub-modal-container')

  const blur = () => {
    elem.querySelector('div.dropub-files').style.filter = 'blur(5px)'
    elem.querySelector('div.dropub-buttons').style.filter = 'blur(5px)'
    elem.querySelector('dropub-notices').style.filter = 'blur(5px)'
  }
  const unblur = () => {
    elem.querySelector('div.dropub-files').style.filter = ''
    elem.querySelector('div.dropub-buttons').style.filter = ''
    elem.querySelector('dropub-notices').style.filter = ''
  }

  function modalPreview (file) {
    blur()
    file.appendTo(modalContainer)
    elem.appendChild(modal)
  }

  let filemap = {}
  torrent.files.forEach(f => { filemap[f.name] = f })
  let selector = 'div.dropub-file div.dropub-filename-label'
  ;[...elem.querySelectorAll(selector)].forEach(el => {
    let name = el.textContent.trim()

    if (filemap[name]) {
      filemap[name].progress = el.parentNode.querySelector('progress')
      filemap[name].getBlobURL((err, url) => {
        if (err) return console.error(err)
        if (filemap[name].progress) filemap[name].progress.value = 1
        elementClass(el).remove('dropub-not-downloaded')
        let a = el.querySelector('a')
        a.href = url
        a.download = name
      })
    }
  })

  selector = 'div.dropub-download-button img'
  ;[...elem.querySelectorAll(selector)].forEach(el => {
    el.onclick = () => {
      let selector = 'div.dropub-filename-label'
      let label = el.parentNode.parentNode.querySelector(selector)
      let name = label.textContent.trim()
      if (filemap[name]) {
        console.log('select')
        filemap[name].select()
      } else {
        console.error('Could not find file in torrent.')
      }
    }
  })

  selector = 'div.dropub-file-emoji img'
  ;[...elem.querySelectorAll(selector)].forEach(el => {
    el.onclick = (e) => {
      let par = el.parentNode.parentNode
      let label = par.querySelector('div.dropub-filename-label')
      let name = label.textContent.trim()
      modalPreview(filemap[name])
    }
  })

  torrent.on('download', () => {
    torrent.files.forEach(f => {
      if (f.done) return
      let downloaded = f.downloaded
      if (downloaded === 0) return
      let percent = downloaded / f.length
      f.progress.value = percent
    })
  })

  // This isn't being used until the deselect actually
  // prevents the files from being downloaded.
  let startDownload = () => {
    torrent.select(0, torrent.pieces.length - 1, 1)

    let _finished = () => {}

    let _update = () => {
      let downloaded = torrent.downloaded
      let percentage = Math.round(downloaded / torrent.length * 100)
      let val = `( ${percentage}% )`
      elem.querySelector('span.dropub-download-radio').textContent = val
      if (downloaded !== torrent.length) setTimeout(_update, 1000)
      else _finished()
    }
    _update()

    elem.querySelector('span.dropub-download').style.display = 'none'
    // TODO: change to pause button
  }
  // elem.querySelector('span.dropub-download').onclick = startDownload

  // Attach notices UI
  let noticeContainer = notices({torrent: torrent})
  elem.appendChild(noticeContainer)

  // Setup Share Button
  let btn = elem.querySelector('div.dropub-share')
  btn.setAttribute('data-clipboard-text', window.location.toString())
  let clip = new Clipboard(btn)
  clip.on('success', () => {
    noticeContainer.addNotice('Copied url to clipboard!')
  })

  // Setup ZIP download button
  let addZipButton = () => {
    let btn = bel`<div class="dropub-zip-download">Download Zip</div>`
    elem.querySelector('div.dropub-buttons').appendChild(btn)

    let worker = new window.Worker('/worker.js')

    btn.onclick = () => {
      let addLoader = container => {
        let el = bel`
        <div class="dropub-loading">
          <div class="dropub-loading-label">Creating Zip</h3>
          <div class="sk-fading-circle">
            <div class="sk-circle1 sk-circle"></div>
            <div class="sk-circle2 sk-circle"></div>
            <div class="sk-circle3 sk-circle"></div>
            <div class="sk-circle4 sk-circle"></div>
            <div class="sk-circle5 sk-circle"></div>
            <div class="sk-circle6 sk-circle"></div>
            <div class="sk-circle7 sk-circle"></div>
            <div class="sk-circle8 sk-circle"></div>
            <div class="sk-circle9 sk-circle"></div>
            <div class="sk-circle10 sk-circle"></div>
            <div class="sk-circle11 sk-circle"></div>
            <div class="sk-circle12 sk-circle"></div>
          </div>
        </div>
        `
        container.appendChild(el)
      }
      modalPreview({appendTo: addLoader})
      let files = []
      torrent.files.forEach(f => {
        f.getBlob((e, blob) => {
          if (e) return alert(e)
          files.push({name: f.name, blob})
          if (files.length === torrent.files.length) {
            worker.postMessage({ type: 'compress', files })
          }
        })
      })
    }

    // listen for messages from the worker
    worker.onmessage = (e) => {
      const data = e.data || {}

      if (data.type === 'compressed') {
        bel `<a href="${data.url}" download="${data.name}"></a>`.click()
        modalContainer.click()
      }
    }
  }
  if (torrent.done) {
    addZipButton()
  } else {
    torrent.on('done', addZipButton)
  }
}

const downarrow = () => bel([emojione.toImage(':arrow_down:')])

const view = funky`
${init}
<dropub-torrent>
  <link href='//fonts.googleapis.com/css?family=Lato:400,700' rel='stylesheet' type='text/css' />
  <style>
    dropub-torrent {
      font-family: 'Lato', sans-serif;
      background-color: #fff;
      // border: 1px solid #e1e8ed;
      border-radius: 5px;
      padding: 15px;
      display: block;
      margin-bottom: 10px;
      margin-left: 10px;
      margin-right: 10px;
      font-size: 18px;
      min-height: min-content;
    }
    div.dropub-download-button img {
      cursor: pointer;
    }
    div.dropub-file {
      padding-top: 10px;
    }
    div.dropub-file a {
      color: black;
    }
    div.dropub-not-downloaded a {
      color: grey;
    }
    div.dropub-files img.emojione,
    div.drop-toplevel-control img.emojione {
      max-height: 1.1em;
      font-size: 18px;
      margin-bottom: -2px;
      line-height: 16px;
    }
    div.dropub-file {
      display: flex;
    }
    div.dropub-file * {
      padding: 2px;
    }
    div.dropub-filename progress {
      width: 100%;
    }
    div.dropub-filename-label {
      margin-bottom: 0px;
      padding-bottom: 0px;
    }
    div.dropub-filename-label a {
      margin-bottom: 0px;
      padding-bottom: 0px;
    }
    div.dropub-filename progress {
      margin-top: 0px;
      padding-top: 0px;
    }
    div.dropub-modal-background {
      display: block;
      position fixed;
      top: 0;
      left: 0;
      height: 100%;
      width:100%;
      position: fixed;
      z-index: 99999;
    }
    div.dropub-file-emoji img {
      cursor: pointer;
    }
    div.dropub-buttons * {
      -webkit-border-radius: 5;
      -moz-border-radius: 5;
      border-radius: 5px;
      font-size: 16px;
      padding: 5px 10px 5px 10px;
      text-decoration: none;
      width: fit-content;
      margin-bottom: 5px;
      cursor: pointer;
      margin-right: 5px;
    }
    div.dropub-share {
      background: #3498db;
      background-image: -webkit-linear-gradient(top, #3498db, #2980b9);
      background-image: -moz-linear-gradient(top, #3498db, #2980b9);
      background-image: -ms-linear-gradient(top, #3498db, #2980b9);
      background-image: -o-linear-gradient(top, #3498db, #2980b9);
      background-image: linear-gradient(to bottom, #3498db, #2980b9);
      color: #ffffff;
    }
    div.dropub-share:hover {
      background: #3cb0fd;
      background-image: -webkit-linear-gradient(top, #3cb0fd, #3498db);
      background-image: -moz-linear-gradient(top, #3cb0fd, #3498db);
      background-image: -ms-linear-gradient(top, #3cb0fd, #3498db);
      background-image: -o-linear-gradient(top, #3cb0fd, #3498db);
      background-image: linear-gradient(to bottom, #3cb0fd, #3498db);
      text-decoration: none;
    }
    div.dropub-zip-download {
      background: #3498db;
      background-image: -webkit-linear-gradient(top, #3498db, #2980b9);
      background-image: -moz-linear-gradient(top, #3498db, #2980b9);
      background-image: -ms-linear-gradient(top, #3498db, #2980b9);
      background-image: -o-linear-gradient(top, #3498db, #2980b9);
      background-image: linear-gradient(to bottom, #3498db, #2980b9);
      color: #ffffff;
    }
    div.dropub-zip-download:hover {
      background: #3cb0fd;
      background-image: -webkit-linear-gradient(top, #3cb0fd, #3498db);
      background-image: -moz-linear-gradient(top, #3cb0fd, #3498db);
      background-image: -ms-linear-gradient(top, #3cb0fd, #3498db);
      background-image: -o-linear-gradient(top, #3cb0fd, #3498db);
      background-image: linear-gradient(to bottom, #3cb0fd, #3498db);
      text-decoration: none;
    }
    div.dropub-buttons {
      display: flex;
    }
    div.dropub-loading-label {
      font-size: 35px;
    }
  </style>
  <div class="dropub-buttons">
    <div class="dropub-share">Share</div>
  </div>
  <div class="dropub-files">
  ${opts => opts.torrent.files.map(f => {
    return fileElement(f)
  })}
  </div>
</dropub-torrent>
`

module.exports = view

  // <div class="drop-toplevel-control">
  //   <span class="dropub-download">${ downarrow() }</span>
  //   <span class="dropub-download-radio"></span>
  //   <span>All</div>
  // </div>
