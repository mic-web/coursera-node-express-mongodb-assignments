const express = require('express')
const bodyParser = require('body-parser')

const dishRouter = express.Router()

dishRouter.use(bodyParser.json())

dishRouter
  .route('/')
  .all((req, res, next) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    next()
  })
  .get((req, res) => {
    res.end('Will send all the dishes to you')
  })
  .post((req, res) => {
    res.end('Will add the dish: ' + req.body.name + ' with details: ' + req.body.description)
  })
  .put((req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /dishes')
  })
  .delete((req, res) => {
    res.end('Deleting all the dishes')
  })

dishRouter
  .route('/:dishId')
  .all((req, res, next) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    next()
  })
  .get((req, res) => {
    res.end('Will send the dish ' + req.params.dishId + ' to you.')
  })
  .put((req, res) => {
    res.end('Will update the dish ' + req.params.dishId)
  })
  .post((req, res) => {
    res.statusCode = 403
    res.end('POST operation not supported on /promotions')
  })
  .delete((req, res) => {
    res.end('Deleting the dish ' + req.params.dishId)
  })

module.exports = dishRouter
