var request = require('supertest');


web = require('./web.js')

const testUser = "homer"
const testPassword = "555"



function makeServer(cb) {

  var web = require('./web')

  const express = require('express')
  const bodyParser = require('body-parser')


  const mockStorage = () => {
    let users = []
    return {
      find: (googleId) => {
        return users.filter(x => x == googleId)
      },
      create: (googleId) => {
        return users.push(googleId)
      },
    }
  }
  const keys = "1234567890"
  const userMock = require('../user/user.js')(mockStorage())


  var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

  passport.use(new LocalStrategy(
    function(username, password, done) {
        if (username == testUser && password == testPassword) {
            return done(null, {user: "user"});
        }

        return done(null, false, { message: 'Incorrect username.' });
    }
  ));
  const webPushMock = () => {
    sendNotification: (e) => {
      console.log("SEND NOTIFICATION" + JSON.stringify(e))
    }
  }

  const app = express()

  app.set('port', (process.env.PORT || 5000))

  app.use(express.static(__dirname + '/public'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }));
  // views is directory for all template files
  app.set('views', __dirname + '/views')
  app.set('view engine', 'ejs')



  web({
    express: app,
    user: userMock,
    webPush: webPushMock,
    pushKeys: keys,
    passport: passport,
  })


  let server = app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'))

  })
  cb(server)
}



makeServer((server) => {
  agent = request.agent

  const nonLoginRedirect = (err,res) => {
    console.log("REDIRECT", res.header['location'])
    if (res.header['location'] == '/login') throw new Error("redirect to login");
  }


  describe('loading express', function () {
    it('responds to /', function (done) {
    agent(server)
      .get('/')
      .expect(200, done);
    });

    it('responds to /login', function (done) {
    agent(server)
      .get('/login')
      .expect(200, done)
    });

    it('dont log with bad password', function (done) {
    agent(server)
      .post('/login')
      .send({username: testUser, password: 'absdfsdf123'})
      .expect(401, done)
    })

    it('log in', function (done) {
    agent(server)
      .post('/login')
      .send({username: testUser, password: testPassword})
      .expect(302, done)
    })

    let sub_id = ""
    it('create subscription and get /home/:sub_id', function (done) {
    agent(server)
      .post('/subscription')
      .end((err,res) => {
        sub_id = res.header['location'].split("/")[2]
        console.log(res.header['location'])
        request(server)
          .get(res.header['location'])
          .expect(200, done)
      })
    });

    it('subscribe', function (done) {
    agent(server)
      .post('/s/' + sub_id)
      .send({
        endpoint: "http://fake.com/end/",
        keys: {p256dh: 'abd', auth:'auth'}
      })
      .expect(200, done);
    });
    it('send push', function (done) {
    agent(server)
      .post('/push/' + sub_id)
      .expect(302, done);
    });
    it('404 everything else', function (done) {
      agent(server)
        .get('/foo/bar')
        .expect(404, done);
    });
  });
})
