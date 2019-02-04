<template>
  <div class="files-page">
    <h2>Files</h2>
    <div>CID: {{cid}}</div>
    <div v-if="files.length">
      <div v-for="file in files" v-bind:key=file.name>
        <div v-if="file.type == 'dir'">
          <router-link :to="{path: file.name}" append>{{file.name}}</router-link>
        </div>
        <div v-if="file.type == 'file'">
          <div v-if="file.url">
            <a :href=file.url>{{file.name}}</a>
          </div>
          <div v-else>
            <div>{{file.name}}</div>
            <progress :max=file.size :value=file.downloaded />
          </div>
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

const getReadableStream = path => new Promise((resolve, reject) => {
  let stream = ipfs.getReadableStream(path)
  stream.once('data', entry => resolve(entry.content))
  stream.on('error', reject)
  stream.on('end', () => reject(new Error('no found')))
})

const loadFiles = async (files, path) => {
  await ipfs.ready
  let dir = await ipfs.ls(path)
  for (let file of dir) {
    file.downloaded = 0
    file.url = null
    files.push(file)
    if (file.type === 'file') {
      getReadableStream(`${path}/${file.name}`).then(stream => {
        let buffers = []
        stream.on('data', buffer => {
          buffers.push(buffer)
          file.downloaded += buffer.length
        })
        stream.on('end', () => {
          let f = new window.Blob(buffers, 'octet/stream')
          file.url = URL.getObjectURL(f)
        })
      })
    }
  }
}

export default {
  name: 'files-page',
  props: ['cid'],
  data: () => ({
    files: []
  }),
  beforeMount: function () {
    let cid = this.$props.cid
    this.$data._cid = cid
    loadFiles(this.$data.files, cid)
  },
  beforeUpdate: function () {
    if (this.$data._cid !== this.$props.cid) {
      this.$data._cid = this.$props.cid
      this.$data.files = []
      loadFiles(this.$data.files, this.$props.cid)
    }
  }
}
</script>
