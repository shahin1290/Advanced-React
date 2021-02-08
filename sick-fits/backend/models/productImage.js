const mongoose = require('mongoose');

module.exports = mongoose.model(
  'ProductImage',
  mongoose.Schema({
    imageUrl: String,
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  })
);
