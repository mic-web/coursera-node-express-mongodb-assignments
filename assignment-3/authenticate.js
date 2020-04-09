const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { Strategy, ExtractJwt } = require('passport-jwt')
const jwt = require('jsonwebtoken')

const User = require('./models/user')
const config = require('./config')

exports.local = passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

exports.getToken = (user) => {
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 })
}

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = config.secretKey

exports.jwtPassport = passport.use(
  new Strategy(opts, (jwtPayload, done) => {
    console.log('JWT payload: ', jwtPayload)
    User.findById(jwtPayload._id, (err, user) => {
      console.log('find', err, user)
      if (err) {
        return done(err, false)
      }
      if (user) {
        return done(null, user)
      }
      return done(null, false)
    })
  }),
)

exports.verifyUser = passport.authenticate('jwt', { session: false })

const isAdmin = (req, res, next) => {
  if (req.user.admin === true) {
    return next()
  }
  const err = new Error('You are not authorized to perform this operation!')
  err.status = 403
  return next(err)
}

exports.verifyAdmin = [exports.verifyUser, isAdmin]
