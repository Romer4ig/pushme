module.exports = (db) => {

  const deserialize = (x) => {
    return {
      id: x.id,
      userId: x.user_id,
      name: x.name,
      createdAt: new Date(x.created_at)
    }
  }

  const pgStorage = {
    all: () => {
      return db.manyOrNone("SELECT id, user_id, name, created_at FROM subscriptions").then(xs => xs.map(deserialize))
    },
    find: (id) => {
      return db.oneOrNone("SELECT id, user_id, name, created_at FROM subscriptions WHERE id=$1", id)
        .then(deserialize)
    },
    findByUserId: (id) => {
      return db.manyOrNone("SELECT id, user_id, name, created_at FROM subscriptions WHERE user_id=$1", id)
        .then(xs => xs.map(deserialize))
    },
    create: (sub) => {
      console.log("SUB", sub)
      return db.none("INSERT INTO subscriptions (user_id,name) VALUES ($1,$2)", [sub.userId, sub.name])
    },
  }


  return require('./subscription.js')(pgStorage)
}
