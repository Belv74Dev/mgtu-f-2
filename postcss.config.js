module.exports = {
  plugins: [
      ['autoprefixer'],
      ['css-mqpacker'],
      ['cssnano',
          {
              preset: [
                  'default', {
                      discardComments: {
                          removeAll: true,
                      }
                  }
              ]
          }
      ]
  ]
}