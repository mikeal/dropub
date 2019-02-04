module.exports = {
  configureWebpack: {
    devServer: {
      disableHostCheck: true
    },
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    },
    output: {
      filename: '[name].[hash].js'
    }
  }
}
