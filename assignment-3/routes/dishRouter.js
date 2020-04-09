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
      .populate('comments.author')
      .then((dishes) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(dishes)
      })
      .catch((err) => next(err))
  })
  .post(authenticate.verifyAdmin, (req, res, next) => {
    Dishes.create(req.body)
      .then((dish) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(dish)
      })
      .catch((err) => next(err))
  })
  .put(authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /dishes')
  })
  .delete(authenticate.verifyAdmin, (req, res) => {
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
      .populate('comments.author')
      .then((dish) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(dish)
      })
      .catch((err) => next(err))
  })
  .put(authenticate.verifyAdmin, (req, res, next) => {
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
  .post(authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end('POST operation not supported on /dishes')
  })
  .delete(authenticate.verifyAdmin, (req, res) => {
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
      .populate('comments.author')
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
          req.body.author = req.user._id
          dish.comments.push(req.body)
          dish
            .save()
            .then((d) => {
              Dishes.findById(d._id)
                .populate('comments.author')
                .then((dishWithAuthor) => {
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.json(dishWithAuthor)
                })
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
  .delete(authenticate.verifyAdmin, (req, res, next) => {
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
      .populate('comments.author')
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
          const comment = dish.comments.id(req.params.commentId)
          if (!req.user._id.equals(comment.author)) {
            const err = new Error('You may not edit the comment of another user!')
            err.status = 403
            return next(err)
          }
          if (req.body.rating) {
            comment.rating = req.body.rating
          }
          if (req.body.comment) {
            comment.comment = req.body.comment
          }
          dish
            .save()
            .then((d) => {
              Dishes.findById(d._id)
                .populate('comments.author')
                .then((dishWithAuthor) => {
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.json(dishWithAuthor)
                })
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
          const comment = dish.comments.id(req.params.commentId)
          if (!req.user._id.equals(comment.author)) {
            const err = new Error('You may not delete the comment of another user!')
            err.status = 403
            return next(err)
          }
          comment.remove()
          dish
            .save()
            .then((d) => {
              Dishes.findById(d._id)
                .populate('comments.author')
                .then((dishWithAuthor) => {
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.json(dishWithAuthor)
                })
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
