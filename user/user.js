module.exports = (storage) => {
  return {
    all: () => {
      return storage.all()
    },

    create: (googleId) => {
      return storage.add(googleId)
    },

    findOrCreate: (googleId) => {
      return storage.find(googleId).then((data) => {
        if(data === null) return storage.create(googleId)

        return data
      })
    }

  }
}
