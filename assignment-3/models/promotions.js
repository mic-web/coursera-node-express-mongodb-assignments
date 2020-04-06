const mongoose = require('mongoose')

const { Schema } = mongoose

require('mongoose-currency').loadType(mongoose)

const { Currency } = mongoose.Types

const promotionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    price: {
      type: Currency,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)

const Promotions = mongoose.model('Promotion', promotionSchema)

module.exports = Promotions
