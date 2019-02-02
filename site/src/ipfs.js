const IPFS = require('ipfs')

const node = IPFS.createNode()
node.ready = new Promise(resolve => node.on('ready', resolve))

module.exports = node
