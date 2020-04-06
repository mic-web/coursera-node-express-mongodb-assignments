const mongoose = require('mongoose')

const { Schema } = mongoose

const leaderSchema = new Schema(
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
    designation: {
      type: String,
      default: '',
    },
    abbr: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

const Leaders = mongoose.model('Leader', leaderSchema)

module.exports = Leaders
