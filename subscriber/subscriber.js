module.exports = (storage) => {
  return {
    all: () => {
      return storage.all()
    },

    create: (sub) => {
      return storage.create(sub)
    },

    find: (id) => {
      return storage.find(id)
    },

    findByUserId: (id) => {
      return storage.findByUserId(id)
    },

    findBySubscriptionId: (id) => {
      return storage.findBySubscriptionId(id)
    },
  }
}
