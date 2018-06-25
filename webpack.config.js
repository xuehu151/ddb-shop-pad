module.exports = {
  devtool: 'eval-source-map',
  entry: __dirname + "/src/index.js", //已多次提及的唯一入口文件
  output: {
    path: __dirname + "/www", //打包后的文件存放的地方
    filename: "bundle.js" //打包后输出文件的文件名
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }
    }]
  }
}
