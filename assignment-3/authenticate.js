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
        return done(null, true)
      }
      return done(null, false)
    })
  }),
)

exports.verifyUser = passport.authenticate('jwt', { session: false })
