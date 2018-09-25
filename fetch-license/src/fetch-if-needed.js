const debug = require("debug")("cache");

async function fetchIfNeeded({ fetchFn, key, cache, maxAgeSeconds, skipCache }) {
  const cachedValue = !skipCache && await cache.get(key);
  const fromCache = !!cachedValue;
  debug(key, fromCache ? "in the cache" : "not in the cache!");
  const fetchAndUpdateCache = async () => {
    const value = await fetchFn(key);
    await cache.set(key, value, maxAgeSeconds * 1000); // expects milliseconds
    return value;
  };
  const data = await (cachedValue || fetchAndUpdateCache());
  const meta = { fromCache };
  return { data, meta };
}

module.exports = fetchIfNeeded;
