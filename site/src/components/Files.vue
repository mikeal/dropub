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
const ipfs = require('../ipfs')

export default {
  name: 'files-page',
  props: ['cid'],
  data: () => ({
    files: []
  }),
  created: async function () {
    let cid = this.$props.cid
    //await ipfs.ready
    //this.$data.files.splice(0, 0, ...(await ipfs.ls(cid))) 
  }
}
</script>

