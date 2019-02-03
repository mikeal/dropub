<template>
  <div class="files-page">
    <h2>Files</h2>
    <div>CID: {{cid}}</div>
    <div v-if="files.length">
    </div>
    <div v-else>
      Loading file information...
    </div>
  </div>
</template>

<script>
// import ipfs from '../ipfs'
// console.log({ipfs})
const IPFS = Ipfs
const ipfs = new IPFS({
  repo: 'dropub'
})
ipfs.ready = new Promise(resolve => ipfs.on('ready', resolve))

export default {
  name: 'files-page',
  props: ['cid'],
  data: () => ({
    files: []
  }),
  created: async function () {
    console.log(3)
    let cid = this.$props.cid
    console.log('cid', cid)
    await ipfs.ready
    console.log('ready')
    let _files = await ipfs.ls(cid)
    console.log(files)
    this.$data.files.splice(0, 0, _files) 
  }
}
</script>

