const express = require('express')
const bodyParser = require('body-parser')
const User = require('../models/user')
const passport = require('passport')

const router = express.Router()
router.use(bodyParser.json())

router.get('/', (req, res, next) => {
  User.find({})
    .then((users) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json({ users: users.map((user) => user.username) })
    })
    .catch((err) => next(err))
})

router.post('/signup', (req, res) => {
  User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.json({ error: err })
    } else {
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json({ success: true, status: 'Registration Successful!', user })
      })
    }
  })
})

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.json({ success: true, status: 'You are logged in' })
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
