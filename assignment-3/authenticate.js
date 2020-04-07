const passport = require('passport')
const { Strategy } = require('passport-local')
const User = require('./models/user')

exports.local = passport.use(new Strategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
