const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { Strategy, ExtractJwt } = require('passport-jwt')
const FacebookStrategy = require('passport-facebook-token')
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

exports.facebookPassport = passport.use(
  new FacebookStrategy(
    {
      clientID: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log('facebook passport tokens', accessToken, refreshToken)
      User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err) {
          return done(err, false)
        }
        if (!err && user !== null) {
          return done(null, user)
        }
        user = new User({ username: profile.displayName })
        user.facebookId = profile.id
        user.firstname = profile.name.givenName
        user.lastname = profile.name.familyName
        user.save((e, u) => {
          if (e) return done(e, false)
          return done(null, u)
        })
      })
    },
  ),
)
