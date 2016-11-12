const funky = require('funky')
const bel = require('bel')

const initNotice = (elem, opts) => {
  let close = bel`<div class="boxclose">✖</div>`
  close.onclick = () => {
    elem.parentNode.removeChild(elem)
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

function init (elem, opts) {
  let torrent = opts.torrent

  elem.addNotice = notice => {

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
      color: #7A7A7A;
    }
    div.boxclose {
      line-height: 10px;
      width: 15px;
      heigth: 15px;
      line-height: 14px;
      font-size: 8pt;
      font-family: tahoma;
      margin-top: 5px;
      margin-right: 5px;

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
