const express = require('express')
const bodyParser = require('body-parser')

const Comments = require('../models/comments')
const Dishes = require('../models/dishes')
const authenticate = require('../authenticate')
const cors = require('./cors')

const commentRouter = express.Router()

commentRouter.use(bodyParser.json())

commentRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    console.log('query', req.query)
    return Comments.find(req.query)
      .populate('author')
      .then((comments) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(comments)
      })
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body !== null) {
      req.body.author = req.user._id
      return Comments.create(req.body)
        .then((comment) => {
          return Comments.findById(comment._id)
            .populate('author')
            .then((c) => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              return res.json(c)
            })
        })
        .catch((err) => next(err))
    }
    const err = new Error('Comment not found in request body')
    err.status = 404
    return next(err)
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end(`PUT operation not supported on /comments/`)
  })
  .delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    return Comments.remove({})
      .then((resp) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(resp)
      })
      .catch((err) => next(err))
  })

commentRouter
  .route('/:commentId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    return Comments.findById(req.params.commentId)
      .populate('author')
      .then((comment) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(comment)
      })
      .catch((err) => next(err))
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
      .then((comment) => {
        if (comment) {
          if (!req.user._id.equals(comment.author)) {
            const err = new Error('You may not edit the comment of another user!')
            err.status = 403
            return next(err)
          }
          req.body.author = req.user._id
          if (req.body.rating) {
            comment.rating = req.body.rating
          }
          if (req.body.comment) {
            comment.comment = req.body.comment
          }
          return Comments.findByIdAndUpdate(req.params.commentId, { $set: req.body }, { new: true })
            .then((c) => {
              Dishes.findById(c._id)
                .populate('author')
                .then((resp) => {
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.json(resp)
                })
            })
            .catch((err) => next(err))
        }
        const err = new Error(`Comment ${req.params.commentId} not found`)
        err.status = 404
        return next(err)
      })
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end(`POST operation not supported on /comments/${req.params.commentId}`)
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
      .then((comment) => {
        if (comment !== null) {
          if (!req.user._id.equals(comment.author)) {
            const err = new Error('You may not delete the comment of another user!')
            err.status = 403
            return next(err)
          }
          return Comments.findByIdAndRemove(req.params.commentId).then((resp) => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(resp)
          })
        }
        const err = new Error(`Comment ${req.params.commendId} not found`)
        err.status = 404
        return next(err)
      })
      .catch((err) => next(err))
  })

module.exports = commentRouter
