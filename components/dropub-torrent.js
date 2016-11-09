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
  console.log(type)
  for (var key in mojimap) {
    if (startsWith(type, key)) return mojimap[key]
  }
  return mojimap.default
}

function fileElement (f) {
  let type = mime.lookup(f.name)
  let el = bel`
  <div class='bb-file'>
    ${ bel([emojione.unicodeToImage(fileEmoji(type))]) }
    <a><span class="dropub-filename dropub-not-downloaded">${
      f.name
    }</span></a>
  </div>
  `
  return el
}

function init (elem, opts) {
  let webtorrent = opts.webtorrent
  let torrentAdded = () => {
    let hashes = webtorrent.torrents.map(t => t.infoHash)
    for (var i = 0; i < hashes.length; i++) {
      if (hashes[i] === opts.torrent.infoHash) return true
    }
    return false
  }

  let startDownload = () => {
    if (!torrentAdded()) {
      webtorrent.add(opts.torrent.magnetURI, torrent => {
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

        let filemap = {}
        torrent.files.forEach(f => { filemap[f.name] = f })
        let selector = 'div.dropub-file span.dropub-filename'
        ;[...elem.querySelectorAll(selector)].forEach(el => {
          let name = el.textContent.trim()
          if (filemap[name]) {
            filemap[name].getBlobURL((err, url) => {
              if (err) return console.error(err)
              elementClass(el).remove('dropub-not-downloaded')
              el.parentNode.href = url
              el.parentNode.download = name
            })
          }
        })
      })
    }
    elem.querySelector('span.dropub-download').style.display = 'none'
    // TODO: change to pause button
  }
  elem.querySelector('span.dropub-download').onclick = startDownload
}

const downarrow = () => bel([emojione.toImage(':arrow_down:')])

const view = funky`
${init}
<dropub-torrent>
  <style>
    dropub-torrent {
      background-color: #fff;
      border: 1px solid #e1e8ed;
      border-radius: 5px;
      padding: 15px;
      display: block;
      margin-bottom: 10px;
      margin-left: 10px;
      margin-right: 10px;
      font-size: 15px;
      min-height: min-content;
    }
    span.dropub-download {
      cursor: pointer;
    }
    div.dropub-file {
      padding: 10px;
    }
    div.dropub-file a {
      color: black;
    }
    div.dropub-file span.dropub-not-downloaded {
      color: grey;
    }
  </style>
  <span class="dropub-download">${ downarrow() }</span>
  <span class="dropub-download-radio"></span>
  <div class="dropub-files">
  ${ opts => opts.torrent.files.map(f => {
    return fileElement(f)
  }) }
  </div>
</dropub-torrent>
`

module.exports = view
