const https = require('https')
var uuid = require('node-uuid')
const express = require('express')
const bodyParser = require('body-parser')
var session = require('express-session')
var cookieParser = require('cookie-parser')

module.exports = function(services) {
  let webPush = services.webPush
  let app = services.express
  const User = services.User
  const Subscription = services.Subscription
  const Subscriber = services.Subscriber
  const passport = services.passport


  passport.serializeUser(function(user, done) {
    done(null, user.id)
  });

  passport.deserializeUser(function(id, done) {
    done(null, {id: id})
  })

  app.use(cookieParser())
  app.use(express.static(__dirname + '/../public'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }))

  app.use(session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  // views is directory for all template files
  app.set('views', __dirname + '/../views')
  app.set('view engine', 'ejs')

  app.get('/', function(req, res) {
    res.render('pages/index')
  })

  const clients = []
  const clientsMap = new Map()

  const Organization = new Map()

  app.post('/subscription', ensureAuthenticated, function(req, res) {
    console.log(req.user)
    Subscription.create({
      userId: req.user.id,
      name: req.body.name,
    }).then(user => {
      res.redirect('/home/');
    }).catch(err => {
      res.status(500)
      res.send(err)
    })
  })

  app.get('/home/', ensureAuthenticated, function(req, res) {
    Subscription.findByUserId(req.user.id).then(subscriptions=>{
      res.render('pages/home', {
        subscriptions: subscriptions
      })
    })

  })

  app.get('/subscription/:id', ensureAuthenticated, function(req, res) {
    const id = req.params.id
    const user = req.user

    Promise.all([Subscriber.findBySubscriptionId(id), Subscription.find(id)]).then(ps => {
      const subscribers = ps[0]
      const sub = ps[1]

      if (sub.userId != user.id) {
        res.status(403)
        res.send("forbidden")
        return
      }

        res.render('pages/subscription', {
          subscription: sub,
          subscribers: subscribers,
        })
    }).catch(err => {
      res.status(404)
      res.send("not found")
    })
  })

  app.get('/s/:id', function(req, res) {
    const subscriptionId = req.params.id
    res.render('pages/subscribe', {
      subscriptionId: subscriptionId,
    })
  })


  app.post('/s/:id', function(req, res) {
    console.log(JSON.stringify(req.params))
    const subscriptionId = req.params.id
    const body = req.body
    const clientPublicKey = body.keys.p256dh
    const clientAuthSecret = body.keys.auth

    Subscription.find(subscriptionId).then(sub => {
      return Subscriber.create({
        userId: sub.userId,
        subscriptionId: subscriptionId,
        endpoint: body.endpoint,
        userAgent: req.get('User-Agent'),
        publicKey: clientPublicKey,
        secret: clientAuthSecret,
      })
    })
    // TODO: createOrFind by publickey???
    .then(x => {
      res.send("subscribed")
    }).catch(err => {
      res.status(500)
      res.send(err)
    })
  })

  // TODO
  app.get('/enable', function(req, res) {
  })

  // TODO
  app.get('/disable', function(req, res) {

  })

  app.get('/key', function(req, res) {
    res.send(JSON.stringify(services.pushKeys.publicKey))
  })

  app.post('/push/:id',ensureAuthenticated, function(req, res) {
    const id = req.params.id

    const body = {
      title: req.body.title,
      tag: req.body.tag,
      icon: req.body.icon,
      body: req.body.body,
      link: req.body.link
    }

    Subscriber.findBySubscriptionId(id).then(xs => {
      xs.forEach(c => {
        console.log("SEND PUSH", c)
        const a = webPush.sendNotification(c.endpoint,{
          userPublicKey: c.publicKey,
          userAuth: c.secret,
          payload: JSON.stringify(body),
        }).then(pushRes => console.log(pushRes))
          .catch(err => console.log(err))
      })

    res.redirect('/subscription/' + id);
    })
  })



  // Use the GoogleStrategy within Passport.
  //   Strategies in Passport require a `verify` function, which accept
  //   credentials (in this case, an accessToken, refreshToken, and Google
  //   profile), and invoke a callback with a user object.

  // GET /auth/google
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in Google authentication will involve
  //   redirecting the user to google.com.  After authorization, Google
  //   will redirect the user back to this application at /auth/google/callback
  app.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

  // GET /auth/google/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/home');
    }
  );

  app.get('/login', function(req, res) {
    res.render('pages/login', {})
  })



  app.post('/login',
    passport.authenticate('google'),
    function(req, res) {
      user.all().then(x => console.log(x))
      // If this function gets called, authentication was successful.
      // `req.user` contains the authenticated user.
      res.redirect('/');
    });


  // =============================================================================


  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
  }


}
