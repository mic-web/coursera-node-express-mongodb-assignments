const express = require('express')
const bodyParser = require('body-parser')
const cors = require('./cors')

const Promotions = require('../models/promotions')
const authenticate = require('../authenticate')

const promotionRouter = express.Router()

promotionRouter.use(bodyParser.json())

promotionRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Promotions.find({})
      .then((promotions) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(promotions)
      })
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.create(req.body)
      .then((promotion) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(promotion)
      })
      .catch((err) => next(err))
  })
  .put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /promotions')
  })
  .delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res) => {
    Promotions.remove({}).then((promotion) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(promotion)
    })
  })

promotionRouter
  .route('/:promotionId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Promotions.findById(req.params.promotionId)
      .then((promotion) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(promotion)
      })
      .catch((err) => next(err))
  })
  .put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndUpdate(
      req.params.promotionId,
      {
        $set: req.body,
      },
      { new: true },
    )
      .then((promotion) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(promotion)
      })
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end('POST operation not supported on /promotions')
  })
  .delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res) => {
    Promotions.findByIdAndRemove(req.params.promotionId).then((promotion) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(promotion)
    })
  })

module.exports = promotionRouter
