const express = require('express')
const bodyParser = require('body-parser')

const Dishes = require('../models/dishes')
const authenticate = require('../authenticate')

const dishRouter = express.Router()

dishRouter.use(bodyParser.json())

dishRouter
  .route('/')
  .get((req, res, next) => {
    Dishes.find({})
      .then((dishes) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(dishes)
      })
      .catch((err) => next(err))
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Dishes.create(req.body)
      .then((dish) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(dish)
      })
      .catch((err) => next(err))
  })
  .put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /dishes')
  })
  .delete(authenticate.verifyUser, (req, res) => {
    Dishes.remove({}).then((dish) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(dish)
    })
  })

dishRouter
  .route('/:dishId')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(dish)
      })
      .catch((err) => next(err))
  })
  .put(authenticate.verifyUser, (req, res, next) => {
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
  .post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end('POST operation not supported on /dishes')
  })
  .delete(authenticate.verifyUser, (req, res) => {
    Dishes.findByIdAndRemove(req.params.dishId).then((dish) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(dish)
    })
  })

dishRouter
  .route('/:dishId/comments')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish !== null) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(dish.comments)
        } else {
          const err = new Error(`Dish ${req.params.dishId} not found`)
          err.status = 404
          return next(err)
        }
      })
      .catch((err) => next(err))
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish !== null) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          dish.comments.push(req.body)
          dish
            .save()
            .then((d) => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.json(d)
            })
            .catch((err) => next(err))
        } else {
          const err = new Error(`Dish ${req.params.dishId} not found`)
          err.status = 404
          return next(err)
        }
      })
      .catch((err) => next(err))
  })
  .put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end(`PUT operation not supported on /dishes/${req.params.dishId}`)
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish !== null && dish.comments !== null) {
          dish.comments.forEach((comment) => {
            dish.comments.id(comment._id).remove()
          })
          dish
            .save()
            .then((d) => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.json(d)
            })
            .catch((err) => next(err))
        } else {
          const err = new Error(`Dish ${req.params.dishId} not found`)
          err.status = 404
          return next(err)
        }
      })
      .catch((err) => next(err))
  })

dishRouter
  .route('/:dishId/comments/:commentId')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish !== null && dish.comments.id(req.params.commentId) !== null) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(dish.comments.id(req.params.commentId))
        } else if (dish == null) {
          const err = new Error(`Dish ${req.params.dishId} not found`)
          err.status = 404
          return next(err)
        } else {
          const err = new Error(`Comment ${req.params.commendId} not found`)
          err.status = 404
          return next(err)
        }
      })
      .catch((err) => next(err))
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish !== null && dish.comments.id(req.params.commentId) !== null) {
          if (req.body.rating) {
            dish.comments.id(req.params.commentId).rating = req.body.rating
          }
          if (req.body.comment) {
            dish.comments.id(req.params.commentId).comment = req.body.comment
          }
          dish
            .save()
            .then((d) => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.json(d)
            })
            .catch((err) => next(err))
        } else if (dish == null) {
          const err = new Error(`Dish ${req.params.dishId} not found`)
          err.status = 404
          return next(err)
        } else {
          const err = new Error(`Comment ${req.params.commendId} not found`)
          err.status = 404
          return next(err)
        }
      })
      .catch((err) => next(err))
  })
  .post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end(`POST operation not supported on /dishes/${req.params.dishId}/comments/${req.params.commentId}`)
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish !== null && dish.comments.id(req.params.commentId) !== null) {
          dish.comments.id(req.params.commentId).remove()
          dish
            .save()
            .then((d) => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.json(d)
            })
            .catch((err) => next(err))
        } else if (dish == null) {
          const err = new Error(`Dish ${req.params.dishId} not found`)
          err.status = 404
          return next(err)
        } else {
          const err = new Error(`Comment ${req.params.commendId} not found`)
          err.status = 404
          return next(err)
        }
      })
      .catch((err) => next(err))
  })

module.exports = dishRouter
