const funky = require('funky')
const bel = require('bel')
const emojione = require('emojione')
const elementClass = require('element-class')
const mime = require('browserify-mime')

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
  let el = bel`
  <div class="dropub-file">
    <div class="dropub-file-emoji">
      ${ bel([emojione.unicodeToImage(fileEmoji(type))]) }
    </div>
    <div class="dropub-filename">
      <div class="dropub-filename-label
                  dropub-not-downloaded"
       ><a>${ f.name }</a></div>
      <progress value=0></progress>
    </div>
  </div>
  `
  return el
}

function init (elem, opts) {
  let webtorrent = opts.webtorrent
  let torrent = opts.torrent

  let filemap = {}
  torrent.files.forEach(f => { filemap[f.name] = f })
  let selector = 'div.dropub-file div.dropub-filename-label'
  ;[...elem.querySelectorAll(selector)].forEach(el => {
    let name = el.textContent.trim()

    if (filemap[name]) {
      filemap[name].progress = el.parentNode.querySelector('progress')
      filemap[name].getBlobURL((err, url) => {
        if (err) return console.error(err)
        filemap[name].progress.value = 1
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

      console.log(filemap[name])
      if (filemap[name]) {
        console.log('select')
        filemap[name].select()
      } else {
        console.error('Could not find file in torrent.')
      }
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
  </style>

  <div class="dropub-files">
  ${ opts => opts.torrent.files.map(f => {
    return fileElement(f)
  }) }
  </div>
</dropub-torrent>
`

module.exports = view

  // <div class="drop-toplevel-control">
  //   <span class="dropub-download">${ downarrow() }</span>
  //   <span class="dropub-download-radio"></span>
  //   <span>All</div>
  // </div>