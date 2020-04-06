const createError = require('http-errors')
const express = require('express')
const path = require('path')
// const cookieParser = require('cookie-parser')
const logger = require('morgan')
const mongoose = require('mongoose')
const session = require('express-session')
const FileStore = require('session-file-store')(session)

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const dishRouter = require('./routes/dishRouter')
const leaderRouter = require('./routes/leaderRouter')
const promitionRouter = require('./routes/promoRouter')

const url = 'mongodb://localhost:27017/conFusion'
const connect = mongoose.connect(url)

connect.then(
  () => {
    console.log('Connected')
  },
  (err) => console.log(err),
)

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// app.use(cookieParser('12345-67890-09876-54321'))
app.use(
  session({
    name: 'session-id',
    secret: '12345-67890-09876-54321',
    saveUninitialized: false,
    resave: false,
    store: new FileStore(),
  }),
)

const auth = (req, res, next) => {
  console.log(req.session)

  if (!req.session.user) {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      const err = new Error('You are not authenticated')
      res.setHeader('WWW-Authenticate', 'Basic')
      err.status = 401
      return next(err)
    }
    const authString = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')
    const username = authString[0]
    const password = authString[1]

    if (username === 'admin' && password === 'password') {
      // res.cookie('user', 'admin', { signed: true })
      req.session.user = 'admin'
      next()
    } else {
      const err = new Error('You are not authenticated')
      res.setHeader('WWW-Authenticate', 'Basic')
      err.status = 401
      return next(err)
    }
  } else if (req.session.user === 'admin') {
    next()
  } else {
    const err = new Error('You are not authenticated!')

    err.status = 401
    return next(err)
  }
}

app.use(auth)

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/dishes', dishRouter)
app.use('/leaders', leaderRouter)
app.use('/promotions', promitionRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app