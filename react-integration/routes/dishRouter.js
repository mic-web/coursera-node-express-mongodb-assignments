const express = require('express')
const bodyParser = require('body-parser')

const Dishes = require('../models/dishes')
const authenticate = require('../authenticate')
const cors = require('./cors')

const dishRouter = express.Router()

dishRouter.use(bodyParser.json())

dishRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Dishes.find(req.query)
      .populate('comments.author')
      .then((dishes) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(dishes)
      })
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.create(req.body)
      .then((dish) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(dish)
      })
      .catch((err) => next(err))
  })
  .put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /dishes')
  })
  .delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res) => {
    Dishes.remove({}).then((dish) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(dish)
    })
  })

dishRouter
  .route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then((dish) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(dish)
      })
      .catch((err) => next(err))
  })
  .put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndUpdate(
      req.params.dishId,
      {
        $set: req.body,
      },
      { new: true },
    )
      .then((dish) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(dish)
      })
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end('POST operation not supported on /dishes')
  })
  .delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res) => {
    Dishes.findByIdAndRemove(req.params.dishId).then((dish) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(dish)
    })
  })

module.exports = dishRouter
