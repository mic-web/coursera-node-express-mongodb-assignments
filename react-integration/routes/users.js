const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const User = require('../models/user')
const authenticate = require('../authenticate')
const cors = require('./cors')

const router = express.Router()
router.use(bodyParser.json())

router.options('*', cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
router.get('/', cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
  User.find({})
    .then((users) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(users)
    })
    .catch((err) => next(err))
})

router.post('/signup', cors.corsWithOptions, (req, res) => {
  User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.json({ err })
    } else {
      if (req.body.firstname) {
        user.firstname = req.body.firstname
      }
      if (req.body.lastname) {
        user.lastname = req.body.lastname
      }
      user.save((e, updatedUser) => {
        if (e) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.json({ err: e })
          return
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json({ success: true, status: 'Registration Successful!', updatedUser })
        })
      })
    }
  })
})

router.post('/login', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      res.statusCode = 401
      res.setHeader('Content-Type', 'application/json')
      return res.json({ success: false, status: 'Login unsuccessful', err: info })
    }
    req.logIn(user, (e) => {
      if (e) {
        res.statusCode = 401
        res.setHeader('Content-Type', 'application/json')
        return res.json({ success: false, status: 'Login unsuccessful', err: info })
      }
      const token = authenticate.getToken({ _id: req.user._id })
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json({ success: true, token, status: 'You are logged in' })
    })
  })(req, res, next)
})

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy()
    res.clearCookie('session-id')
    res.redirect('/')
  } else {
    const err = new Error('You are not logged in')
    err.status(403)
    return next(err)
  }
})

router.get(
  '/facebook/token',
  passport.authenticate('facebook-token'),
  (req, res) => {
    console.log('request token user', req.user)
    if (req.user) {
      const token = authenticate.getToken({ _id: req.user._id })
      console.log('request token', token)
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json({ success: true, token, status: 'You are successfully logged in!' })
    }
  },
  (error, req, res, next) => {
    console.log(error)
    next(error)
  },
)

router.get('/checkJWTToken', cors.corsWithOptions, (res, req, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      res.statusCode = 401
      res.setHeader('Content-Type', 'application/json')
      return res.json({ status: 'JWT invalid!', success: false, err: info })
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    return res.json({ status: 'JWT invalid!', success: true, user })
  })(req, res)
})

module.exports = router
