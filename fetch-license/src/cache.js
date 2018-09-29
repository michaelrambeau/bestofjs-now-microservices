const Keyv = require("keyv");

const namespace = "v1";

function createCache({ inMemory, uri }) {
  const options = {
    collection: "licenses",
    namespace: "v1",
    // Override the default serializer to make data in MongoDB simpler to read:
    // values as stored as JSON objects instead of strings
    serialize: _ => _
  };
  const cache = inMemory ? new Keyv() : new Keyv(uri, options);
  return cache;
}

function findAll(cache) {
  const re = new RegExp(`^${namespace}`);
  return cache.opts.store.mongo.find(
    { key: re },
    {
      key: 1,
      expiresAt: 1,
      "value.value.meta.duration": 1,
      "value.value.meta.count": 1
    },
    { sort: { expiresAt: 1 } }
  );
}

module.exports = {
  createCache,
  findAll
};
