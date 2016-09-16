module.exports = (db) => {

  const deserialize = (x) => {
    return {
      id: x.id,
      userId: x.user_id,
      subscriptionId: x.subscription_id,
      endpoint: x.endpoint,
      userAgent: x.user_agent,
      publicKey: x.public_key,
      secret: x.secret,
      createdAt: new Date(x.created_at)
    }
  }

  const pgStorage = {
    all: () => {
      return db.manyOrNone("SELECT id, user_id,subscription_id, endpoint,user_agent,public_key,secret,created_at FROM subscribers").then(xs => xs.map(deserialize))
    },
    find: (id) => {
      return db.oneOrNone("SELECT id, user_id, subscription_id, endpoint,user_agent,public_key,secret,created_at FROM subscribers WHERE id=$1", id)
        .then(deserialize)
    },
    findByUserId: (id) => {
      return db.manyOrNone("SELECT id, user_id,subscription_id, endpoint,user_agent,public_key,secret,created_at FROM subscribers WHERE user_id=$1", id)
        .then(xs => xs.map(deserialize))
    },
    findBySubscriptionId: (id) => {
      return db.manyOrNone("SELECT id, user_id,subscription_id, endpoint,user_agent,public_key,secret,created_at FROM subscribers WHERE subscription_id=$1", id)
        .then(xs => xs.map(deserialize))
    },
    create: (sub) => {
      return db.none("INSERT INTO subscribers (user_id,subscription_id,endpoint,user_agent,public_key,secret) VALUES ($1,$2,$3,$4,$5,$6)",
                     [sub.userId, sub.subscriptionId, sub.endpoint,sub.userAgent, sub.publicKey , sub.secret])
    },
  }


  return require('./subscriber.js')(pgStorage)
}
