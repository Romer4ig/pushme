'use strict';


const webPush = require('web-push')

var web = require('./web')

const express = require('express')
const bodyParser = require('body-parser')


const pgp = require("pg-promise")(/*options*/);
const db = pgp(process.env.DATABASE_URL)

const User = require('../user')(db)
const Subscription = require('../subscription')(db)
const Subscriber = require('../subscriber')(db)


const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy


const app = express()

app.set('port', (process.env.PORT || 3000))


webPush.setGCMAPIKey(process.env.GCM_KEY)
let keys = webPush.generateVAPIDKeys()


//  1050717244014-mkejiesh14sqlt202k3n3va44md1tonv.apps.googleusercontent.com
const strategy = new GoogleStrategy({
    clientID: process.env.PASSPORT_GOOGLECLIENTID,
    clientSecret: process.env.PASSPORT_GOOGLESECRET,
    callbackURL: process.env.PASSPORT_GOOGLECALLBACKURL
  }, function(accessToken, refreshToken, profile, done) {
    console.log("accesstoken=",accessToken)
    console.log("refreshtoken=",refreshToken)
    console.log("profile=",profile)
        User
          .findOrCreate(profile.id)
          .then( function (user) {
            console.log("CREATE_OR_FIND USER: ", user)
            return done(null, user);
          })
          .catch(err=> done(err,null));
  })
passport.use(strategy)

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'))
})


module.exports = () => web({
  express: app,
  User: User,
  Subscription: Subscription,
  Subscriber: Subscriber,
  passport: passport,
  webPush: webPush,
  pushKeys: keys
})
