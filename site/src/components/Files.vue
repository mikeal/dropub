<template>
  <div class="files-page">
    <h2>Files</h2>
    <div>CID: {{cid}}</div>
    <div>blah</div>
    <div v-if="files.length">
      <div v-for="file in files" v-bind:key=file.name>
        <div>t: {{file.name}}</div>
        <div v-if="file.type == 'dir'">
          <router-link :to="{path: file.name}" append>{{file.name}}</router-link>
        </div>
        <div v-if="file.type == 'file'">
        </div>
      </div>
    </div>
    <div v-else>
      Loading file information...
    </div>
  </div>
</template>

<script>
const IPFS = window.Ipfs
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
  beforeMount: async function () {
    let cid = this.$props.cid
    await ipfs.ready
    console.log('ready')
    let _files = await ipfs.ls(cid)
    for (let file of _files) {
      this.$data.files.push(file)
    }
  }
}
</script>
