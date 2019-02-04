import IPFS from 'ipfs'
const node = new IPFS({ repo: 'dropub' })
console.log('i3')
node.ready = new Promise(resolve => node.on('ready', resolve))
console.log('i4')
console.log({ node })
export default node
