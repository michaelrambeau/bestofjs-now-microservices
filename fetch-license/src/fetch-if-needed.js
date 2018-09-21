const debug = require("debug")("cache");

async function fetchIfNeeded({ fetchFn, key, cache }) {
  const cachedValue = await cache.get(key);
  const fromCache = !!cachedValue;
  debug(key, fromCache ? "in the cache" : "not in the cache!");
  const fetchAndUpdateCache = async () => {
    const value = await fetchFn(key);
    const maxAge = 24 * 3600 * 60;
    await cache.set(key, value, maxAge * 1000); // expects milliseconds
    return value;
  };
  const data = await (cachedValue || fetchAndUpdateCache());
  const meta = { fromCache };
  return { data, meta };
}

module.exports = fetchIfNeeded;
