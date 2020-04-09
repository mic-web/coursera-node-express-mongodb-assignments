const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const User = require('../models/user')
const authenticate = require('../authenticate')

const router = express.Router()
router.use(bodyParser.json())

router.get('/', authenticate.verifyAdmin, (req, res, next) => {
  User.find({})
    .then((users) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(users)
    })
    .catch((err) => next(err))
})

router.post('/signup', (req, res) => {
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

router.post('/login', passport.authenticate('local'), (req, res) => {
  const token = authenticate.getToken({ _id: req.user._id })
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.json({ success: true, token, status: 'You are logged in' })
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

module.exports = router
