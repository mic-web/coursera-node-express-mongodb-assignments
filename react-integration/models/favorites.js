const mongoose = require('mongoose')

const { Schema } = mongoose

const favoritesSchema = new Schema(
  {
    dishes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish',
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
)

const Favorites = mongoose.model('Favorite', favoritesSchema)

module.exports = Favorites
