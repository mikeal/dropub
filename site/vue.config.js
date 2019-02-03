module.exports = {
  configureWebpack: {
    devServer: {
      disableHostCheck: true
    },
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    }
  }
}
