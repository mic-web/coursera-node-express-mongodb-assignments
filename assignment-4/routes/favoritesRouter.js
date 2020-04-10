const express = require('express')
const bodyParser = require('body-parser')

const Favorites = require('../models/favorites')
const authenticate = require('../authenticate')
const cors = require('./cors')

const favoriteRouter = express.Router()

favoriteRouter.use(bodyParser.json())

favoriteRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate('user')
      .populate('dishes')
      .then((favorites) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(favorites)
      })
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndUpdate({ user: req.user._id }, { user: req.user._id }, { upsert: true, new: true })
      .then((favorite) => {
        const alreadyAdded = (dish) => favorite.dishes.find((fd) => fd._id.equals(dish._id))
        const newFavorites = req.body.filter((dish) => !alreadyAdded(dish))
        favorite.dishes = favorite.dishes.concat(newFavorites)
        return favorite.save().then((resultFavorite) => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(resultFavorite)
        })
      })
      .catch((err) => next(err))
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /favorites')
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({ user: req.user._id })
      .then((favorite) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(favorite)
      })
      .catch((err) => next(err))
  })

favoriteRouter
  .route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, cors.cors, (req, res) => {
    res.statusCode = 403
    res.end('GET operation not supported on /favorites/dishId')
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /favorites/dishId')
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndUpdate({ user: req.user._id }, { user: req.user._id }, { upsert: true, new: true })
      .then((favorite) => {
        const favoriteDish = favorite.dishes.find((dId) => dId.equals(req.params.dishId))
        if (favoriteDish) {
          const err = new Error('Already added this dish as a favorite!')
          err.status = 400
          return next(err)
        }
        favorite.dishes.push(req.params.dishId)
        return favorite.save().then((resultFavorite) => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(resultFavorite)
        })
      })
      .catch((err) => next(err))
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorite) => {
        if (!favorite) {
          const err = new Error('Favorite does not exist')
          err.status = 400
          return next(err)
        }
        const dish = favorite.dishes.find((dId) => dId.equals(req.params.dishId))
        if (!dish) {
          const err = new Error('Dish favorite does not exist!')
          err.status = 400
          return next(err)
        }
        favorite.dishes = favorite.dishes.filter((d) => {
          return !d.equals(dish)
        })
        return favorite.save().then((f) => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(f)
        })
      })
      .catch((err) => next(err))
  })

module.exports = favoriteRouter
