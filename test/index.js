const babel = require('babel-core')
const {resolve} = require('path')
const fs = require('fs')
const plugin = require('../src').default

fs.readdirSync(resolve(__dirname, 'before')).forEach(toJSFile)

function toJSFile (fileName) {
  babel.transformFile(resolve(__dirname, 'before', fileName), {plugins: [plugin]}, (err, res) => {
    if (err) return console.error(err)
    fs.writeFileSync(resolve(__dirname, 'after', fileName), res.code)
  })
}
