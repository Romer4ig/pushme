# Push_me

Для запуска на localhost:

```
PASSPORT_GOOGLECLIENTID='DEF.apps.googleusercontent.com' PASSPORT_GOOGLESECRET='ABC' PASSPORT_GOOGLECALLBACKURL='http://localhost:3000/auth/google/callback' DATABASE_URL='DB_URL'
GCM_KEY='key' node index.js
```

Your app should now be running on [localhost:3000](http://localhost:3000/).

## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```
or




### SQL

```
CREATE TABLE users (id SERIAL PRIMARY KEY,google_id varchar(128),created_at timestamp DEFAULT current_timestamp);
CREATE TABLE subscriptions (id uuid DEFAULT uuid_generate_v4(), user_id int, name varchar(200),created_at timestamp DEFAULT current_timestamp);
CREATE TABLE subscribers (id SERIAL PRIMARY KEY, user_id int, subscription_id uuid, endpoint text,user_agent varchar(200),public_key varchar(200),secret varchar(200),created_at timestamp DEFAULT current_timestamp);
```


[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Documentation

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started with Node.js on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)
