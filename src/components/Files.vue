<template>
  <div class="files-page">
    <h2>Files</h2>
    <div>CID: {{cid}}</div>
    <div v-if="files.length" class="files-container">
      <div v-for="file in files" v-bind:key=file.name class="file-container">
        <div v-if="file.type == 'dir'" class="file file-dir">
          <router-link :to="{path: file.name}" append>{{file.name}}</router-link>
        </div>
        <div v-if="file.type == 'file'" class="file file-file">
          <FileIcon />
          <div v-if="file.url" class="file-name file-download">
            <a :href=file.url :download=file.name>{{file.name}}</a>
          </div>
          <div v-else class="file-name file-downloading">
            <div>{{file.name}}</div>
            <progress :max=file.size :value=file.downloaded />
          </div>
          <div class="file-size">{{file.size}}</div>
        </div>
      </div>
    </div>
    <div v-else>
      Loading file information...
    </div>
  </div>
</template>

<script>
import { FileIcon } from 'vue-feather-icons'
const mime = require('mime')
const IPFS = window.Ipfs
const ipfs = new IPFS({
  repo: 'dropub'
})
ipfs.ready = new Promise(resolve => ipfs.on('ready', resolve))

const getReadableStream = path => new Promise((resolve, reject) => {
  let stream = ipfs.getReadableStream(path)
  stream.once('data', entry => resolve(entry))
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
      getReadableStream(`${path}/${file.name}`).then(entry => {
        let buffers = []
        let stream = entry.content
        stream.resume()
        file.size = entry.size

        stream.on('data', buffer => {
          buffers.push(buffer)
          file.downloaded += buffer.length
        })
        stream.on('end', () => {
          const f = new window.Blob(buffers, { type: mime.getType(file.name) })
          const url = window.URL.createObjectURL(f)
          file.url = url
        })
      })
    }
  }
}

export default {
  name: 'files-page',
  props: ['cid'],
  components: { FileIcon },
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

<style scoped>
div.files-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
div.file-container {
  width: 400px;
}
div.file {
  display: grid;
  grid-template-columns: 30px 300px 50px;
  grid-template-rows: auto;
  grid-template-areas:
    "FileIcon div.file-name div.file-size"
    ". progress .";
}
div.file-name {
  text-align: left;
}
progress {
  width: 100%;
}
</style>
