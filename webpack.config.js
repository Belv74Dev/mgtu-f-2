const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const optimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

const PATH = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist'),
};

const isDev = process.env.NODE_ENV === 'development',
      isProd = !isDev;

const optimizetion = () => {
  const config = {};
  if (isProd) {
    config.minimizer = [
      new optimizeCssAssetsWebpackPlugin(),
      new TerserPlugin()
    ]
  }
  return config;
}

module.exports = {
  context: PATH.src,
  mode: (isDev?'development':'production'),
  entry: {
    main: './index.js',
  },
	experiments: {
		topLevelAwait: true
	},
  output: {
    filename: '[name].[contenthash].js',
    path: PATH.dist,
    clean: true,
  },
  optimization: optimizetion(),
  devServer: {
    static: PATH.src,
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: 'index.html',
      inject: 'body',
      minify: false,
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'style.[contenthash].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
          { from: `${PATH.src}/img`, to: `${PATH.dist}/img`, noErrorOnMissing: true},
          { from: `${PATH.src}/fonts`, to: `${PATH.dist}/fonts`, noErrorOnMissing: true},
      ]
  }),
  ],
  module: {
    rules: [
      {
        test: /\.(s*)css$/,
        use: [
          MiniCssExtractPlugin.loader, 
          {
            loader: 'css-loader',
            options: {
              url: false
            },
          },
          () => {
            if (isProd) return 'postcss-loader', 'sass-loader';
            else return 'sass-loader'
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: () => {
          if (isProd) return {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          };
          return {loader: 'babel-loader',};
        }
      }, 
      {
        test: /\.(png|jpg|svg|gif)$/i,
        loader: 'file-loader',
        options: {
          name: 'img/[name].[ext]',
        }
      },
      {
        test: /\.(eot|otf|svg|ttf|woff)$/i,
        loader: 'file-loader',    
        options: {
          name: './fonts/[name].[ext]',
        },                             
      },
    ]
  }
}