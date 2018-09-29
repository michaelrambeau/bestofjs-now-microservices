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

/*
Build a `Map` object from the database cache, that contains only useful `meta` data
used to select the packages to update every time the job runs.
*/
async function buildMetaLocalCache(cache) {
  const re = new RegExp(`^${namespace}`);
  const entries = await cache.opts.store.mongo.find(
    { key: re },
    {
      "value.value.meta.date": 1,
      "value.value.meta.version": 1,
      "value.value.meta.name": 1
    },
    { sort: { expiresAt: 1 } }
  );
  const map = new Map();
  entries.forEach(entry => {
    const { meta } = entry.value.value;
    const key = meta.name;
    map.set(key, meta);
  });
  return map;
}

module.exports = {
  createCache,
  findAll,
  buildMetaLocalCache
};
