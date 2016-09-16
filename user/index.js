module.exports = (db) => {
  const pgStorage = {
    all: () => {
      return db.many("SELECT id,google_id,created_at FROM users")
    },
    find: (googleId) => {
      return db.oneOrNone("SELECT id,google_id,created_at FROM users WHERE google_id=$1", googleId)
    },
    create: (googleId) => {
      return db.none("INSERT INTO users (google_id) VALUES ($1)", googleId)
    },
  }


  return require('./user.js')(pgStorage)
}
