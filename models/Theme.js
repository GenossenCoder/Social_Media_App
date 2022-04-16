const {model, Schema} = require('mongoose')

const schemaTheme = new Schema({
    theme: String,
    posts:[String]
})
module.exports = model('theme', schemaTheme)