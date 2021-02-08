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
  photo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductImage'
  }]
})

module.exports = mongoose.model('Product', schema)