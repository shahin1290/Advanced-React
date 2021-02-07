const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    minlength: 5
  },
})

module.exports = mongoose.model('Product', schema)