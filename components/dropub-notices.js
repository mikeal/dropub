const funky = require('funky')
const bel = require('bel')

const reflow = () => {
  ;[...document.querySelectorAll('dropub-notice')].forEach(el => {
    let top = el.offsetTop - 5
    el.querySelector('div.boxclose').style['margin-top'] = top + 'px'
  })
}

const initNotice = (elem, opts) => {
  let close = bel`<div class="boxclose">✖</div>`
  close.onclick = () => {
    elem.parentNode.removeChild(elem)
    reflow()
  }
  elem.appendChild(close)
}

const seedView = funky`
${initNotice}
<dropub-notice>
  <div>You are seeding these files.</div>
  <div><strong>Keep this browser window open for others to download the files!</strong></div>
</dropub-notice>
`

const noticeView = funky`
${initNotice}
<dropub-notice>
  <div>${ str => str }</div>
</dropub-notice>
`

function init (elem, opts) {
  let torrent = opts.torrent

  elem.addNotice = str => {
    let el = noticeView(str)
    elem.appendChild(el)
    setTimeout(reflow, 0) // Defer in case they dynamically add content.
    return el
  }
  if (torrent.done) {
    let seed = seedView()
    elem.appendChild(seed)
  }
}

const view = funky`
${init}
<dropub-notices>
  <style>
    dropub-notices {
      position: absolute;
      right: 0;
      top: 0;
      display: flex;
      padding: 10px;
      flex-direction: column;
    }
    dropub-notices dropub-notice {
      width: 250px;
      background-color: #B0E2FF;
      border-radius: 10px;
      border-color: #3ac9ff;
      border-style: solid;
      border-width: 1px;
      font-size: 14px;
      padding: 10px;
      color: #5E5E5E;
      margin: 5px;
    }
    div.boxclose {
      line-height: 10px;
      width: 15px;
      heigth: 15px;
      line-height: 14px;
      font-size: 8pt;
      font-family: tahoma;
      margin-top: 10px;
      margin-right: 10px;

      position:absolute;
      top:0;
      right:0;

      background-color: #B0E2FF;
      border-radius: 10px;
      border-color: #3ac9ff;
      border-style: solid;
      border-width: 1px;

      text-align: center;
      vertical-align: middle;

      color: #3ac9ff;
      cursor: pointer;
    }
  </style>
</dropub-notices>
`

module.exports = view
module.exports.reflow = reflow