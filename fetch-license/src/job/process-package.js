const debug = require("debug")("verbose");
const fetchLicenseData = require("../fetch-license-data");

const addCacheData = cache => async project => {
  const { npm, version } = project;
  const key = npm;
  const cachedValue = await cache.get(key);
  const inCache = !!cachedValue; // && cachedValue.status === "OK";
  const versionInCache = cachedValue && cachedValue.meta.version;
  const lastUpdate = cachedValue && cachedValue.meta.date;
  return { key, version, lastUpdate, inCache, versionInCache };
};

const wasUpdatedRecently = ({ lastUpdate, now }) => {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  return now - lastUpdate < ONE_DAY;
};

const needUpdate = ({ key, version, lastUpdate, inCache, versionInCache }) => {
  if (!inCache) {
    debug(key, "Not in the cache => update it!");
    return true;
  }
  if (inCache && wasUpdatedRecently({ lastUpdate, now: new Date() })) {
    debug(key, "Updated recently => no update");
    return false;
  }
  if (version !== versionInCache) {
    debug(
      key,
      `Version in the cache ${versionInCache} is not the last one ${version} => update it!`
    );
    return true;
  }
  debug(key, "Cache is up-to-date");
  return false;
};

const fetchLicenseAndUpdateCache = async ({
  packageName,
  cache,
  maxAgeSeconds
}) => {
  const value = await fetchLicenseData(packageName); // return `{ meta, licenses, packages }`
  const key = packageName;
  await cache.set(key, value, maxAgeSeconds * 1000);
  return value;
};

module.exports = {
  needUpdate,
  addCacheData,
  fetchLicenseAndUpdateCache
};
