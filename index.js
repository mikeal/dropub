/* globals history, URL */
const torrentView = require('./components/dropub-torrent')
const webtorrent = require('webtorrent')()
const dragDrop = require('drag-drop')
const bel = require('bel')
const title = 'Dropub'

const url = new URL(window.location.toString())
const search = url.searchParams
const container = document.getElementById('main-container')
const clear = () => {
  pageTitle.innerHTML = ''
  container.innerHTML = ''
}
const fill = elem => {
  clear()
  container.appendChild(elem)
}
const updateUrl = search => {
  history.pushState({}, title, search)
}

let isEmbed
if (search.get('embed') && search.get('embed') !== 'false') {
  let embedStyles = bel`
  <style>
    body {
      background-color: white;
    }
    a#github-link {
      display:none;
    }
    div#page-title {
      top: .25em;
      color: grey;
      font-size: 27px;
    }
    div#main-container {
      justify-content: flex-start;
    }
    dropub-torrent {
      margin: 0;
    }
  </style>
  `
  document.body.appendChild(embedStyles)
  isEmbed = true
}

function showTorrentView (search) {
  let magnet = `magnet:${search}`
  webtorrent.add(magnet, torrent => {
    // torrent.files.forEach(f => f.deselect())
    let elem = torrentView({webtorrent, torrent})
    fill(elem)
  })
}

const dropElement = bel`
<div class="drop-files">
  <div class="spinner">
    <div class="double-bounce1"></div>
    <div class="double-bounce2"></div>
  </div>
</div>
`
dropElement.onclick = () => {
  let input = document.getElementById('fileInput')
  input.click()
}

let fileInput = document.getElementById('fileInput')

fileInput.onchange = () => {
  seed(fileInput.files)
}

let pageTitle = document.getElementById('page-title')

function seed (files) {
  webtorrent.seed(files, torrent => {
    let elem = torrentView({webtorrent, torrent})
    let search = torrent.magnetURI.slice('magnet:'.length)
    fill(elem)
    updateUrl(search)
    pageTitle.innerHTML = ''

    if (isEmbed && torrent.done) {
      let msg = {
        app: 'dropub',
        api: 'https://bongbong.chat/api/v1',
        embed: `https://dropub.com${search}&embed=true`
      }
      window.parent.postMessage(msg, '*')
    }
  })
}

const processingElement = bel`
<div class="drop-files">
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

function showDropView () {
  fill(dropElement)
  pageTitle.textContent = 'Drop Files To Share'
  window.onload = () => {
    dragDrop('body', files => {
      fill(processingElement)
      pageTitle.textContent = 'Creating Torrent'
      seed(files)
    })
  }
}

function isMagnet () {
  let params = ['xt', 'dn', 'tr']
  for (var i = 0; i < params.length; i++) {
    if (search.has(params[i])) return true
  }
  return false
}

if (isMagnet()) {
  showTorrentView(window.location.search)
} else {
  showDropView()
}

window.onpopstate = () => {
  window.location.reload(false)
}
