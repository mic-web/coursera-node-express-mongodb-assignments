const express = require('express')
const bodyParser = require('body-parser')
const User = require('../models/user')

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

router.post('/signup', (req, res, next) => {
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (user !== null) {
        const err = new Error(`User ${req.body.username} already exists`)
        err.status = 403
        return next(err)
      }
      return User.create({
        username: req.body.username,
        password: req.body.password,
      }).then((u) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json({ status: 'Registration Successful!', u })
      })
    })
    .catch((err) => next(err))
})

router.post('/login', (req, res, next) => {
  if (!req.session.user) {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      const err = new Error('You are not authenticated')
      res.setHeader('WWW-Authenticate', 'Basic')
      err.status = 401
      return next(err)
    }

    User.findOne({ username: req.body.username })
      .then((user) => {
        if (user === null) {
          const err = new Error(`User ${user} does not exist`)
          err.status = 403
          return next(err)
        }
        if (user.password !== req.body.password) {
          const err = new Error(`You password is incorrect`)
          err.status = 403
          return next(err)
        }
        req.session.user = 'authenticated'
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/plain')
        res.end('You are authenticated')
      })
      .catch((err) => next(err))
  } else {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('You are already authenticated!')
  }
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
