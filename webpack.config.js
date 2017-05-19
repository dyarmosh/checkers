var path = require('path');

module.exports = {
  context: __dirname,
  //entry: './frontend/js/app.js',
  entry: {
    app: './app.jsx'
  },
  output: {
    path: __dirname,
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx$/,
        //include: path.resolve(__dirname, '/react-models'),
        //exclude: path.resolve(__dirname, '/node_modules'),
        loader: "babel-loader"
      }
    ],
    //noParse: new RegExp('^' + path.resolve(__dirname + '/node_modules/'))
  },
  externals: [
    {
      'react/addons': 'var React',
      'react-router': 'var ReactRouter'
    }
  ]
};
