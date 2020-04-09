const createError = require('http-errors')
const express = require('express')
const path = require('path')
const logger = require('morgan')
const mongoose = require('mongoose')
const passport = require('passport')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const dishRouter = require('./routes/dishRouter')
const leaderRouter = require('./routes/leaderRouter')
const promotionRouter = require('./routes/promoRouter')
const config = require('./config')

const url = config.mongoUrl
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

app.use(passport.initialize())

// Position before other routes to ensure authentication on them
app.use('/', indexRouter)
app.use('/users', usersRouter)

app.use(express.static(path.join(__dirname, 'public')))

app.use('/dishes', dishRouter)
app.use('/leaders', leaderRouter)
app.use('/promotions', promotionRouter)

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
