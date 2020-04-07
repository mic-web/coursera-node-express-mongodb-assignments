const createError = require('http-errors')
const express = require('express')
const path = require('path')
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
app.use(
  session({
    name: 'session-id',
    secret: '12345-67890-09876-54321',
    saveUninitialized: false,
    resave: false,
    store: new FileStore(),
  }),
)

// Position before other routes to ensure authentication on them
app.use('/', indexRouter)
app.use('/users', usersRouter)

const auth = (req, res, next) => {
  if (!req.session.user) {
    const err = new Error('You are not authenticated')
    err.status = 401
    return next(err)
  }
  if (req.session.user === 'authenticated') {
    return next()
  }
  const err = new Error('You are not authenticated')
  err.status = 403
  return next(err)
}

app.use(auth)

app.use(express.static(path.join(__dirname, 'public')))

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
