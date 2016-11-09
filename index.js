/* globals history */
const torrentView = require('./components/dropub-torrent')
const webtorrent = require('webtorrent')()
const dragDrop = require('drag-drop')
const bel = require('bel')
const title = 'Dropub'

const search = window.location.search
const container = document.getElementById('main-container')
const clear = () => { container.innerHTML = '' }
const fill = elem => {
  clear()
  container.appendChild(elem)
}
const updateUrl = search => {
  history.pushState({}, title, search)
}

function showTorrentView (search) {
  let magnet = `magnet:${search}`
  console.log(magnet)
  webtorrent.add(magnet, torrent => {
    console.log(torrent)
    torrent.deselect(0, torrent.pieces.length - 1, false)
    let elem = torrentView({webtorrent, torrent})
    fill(elem)
  })
}

function showDropView () {
  fill(bel`<div class="drop-files"><div>Drop files here.</div></div>`)
  window.onload = () => {
    dragDrop('body', files => {
      console.log(files)
      webtorrent.seed(files, torrent => {
        console.log(torrent)
        let elem = torrentView({webtorrent, torrent})
        let search = torrent.magnetURI.slice('magnet:'.length)
        fill(elem)
        console.log(search)
        updateUrl(search)
      })
    })
  }
}

if (search.length) {
  showTorrentView(search)
} else {
  showDropView()
}
