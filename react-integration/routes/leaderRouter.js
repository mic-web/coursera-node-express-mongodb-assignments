const express = require('express')
const bodyParser = require('body-parser')

const cors = require('./cors')
const Leaders = require('../models/leaders')
const authenticate = require('../authenticate')

const leaderRouter = express.Router()

leaderRouter.use(bodyParser.json())

leaderRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Leaders.find(req.query)
      .then((leaders) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(leaders)
      })
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Leaders.create(req.body)
      .then((leader) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(leader)
      })
      .catch((err) => next(err))
  })
  .put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /leaders')
  })
  .delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res) => {
    Leaders.remove({}).then((leader) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(leader)
    })
  })

leaderRouter
  .route('/:leaderId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Leaders.findById(req.params.leaderId)
      .then((leader) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(leader)
      })
      .catch((err) => next(err))
  })
  .put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Leaders.findByIdAndUpdate(
      req.params.leaderId,
      {
        $set: req.body,
      },
      { new: true },
    )
      .then((leader) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(leader)
      })
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end('POST operation not supported on /leaders')
  })
  .delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res) => {
    Leaders.findByIdAndRemove(req.params.leaderId).then((leader) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(leader)
    })
  })

module.exports = leaderRouter
