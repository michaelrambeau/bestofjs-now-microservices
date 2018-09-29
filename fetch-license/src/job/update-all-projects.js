const debug = require("debug")("*");
const uniq = require("lodash.uniq");
const pSeries = require("p-series");
const pMap = require("p-map");
const prettyMs = require("pretty-ms");

const { fetchProjects } = require("./fetch-projects");
const {
  needUpdate,
  addCacheData,
  fetchLicenseAndUpdateCache
} = require("./process-package");

async function updateAllProjects({ cache, limit, maxAgeSeconds, dryRun }) {
  debug("Fetching all projects...");
  const { featured, popular, trending } = await fetchProjects();
  const candidates = uniq([].concat(featured, popular, trending)).slice(0, 100);
  const packagesWithCacheData = await pMap(candidates, addCacheData(cache), {
    concurrency: 1
  });
  debug("Packages to check", candidates.length);
  const toBeUpdated = packagesWithCacheData.filter(needUpdate).slice(0, limit);
  debug("Packages to update", toBeUpdated.length, toBeUpdated.map(p => p.key));
  const update = dryRun
    ? item => () => Promise.resolve(item)
    : ({ key }) => () => {
        debug("Fetching", key);
        return fetchLicenseAndUpdateCache({
          packageName: key,
          cache,
          maxAgeSeconds
        });
      };
  const tasks = toBeUpdated.map(update);
  const result = await pSeries(tasks);
  debug(result.map(item => item.meta || item));
  const duration = dryRun
    ? 0
    : result
        .map(item => item.meta.duration)
        .reduce((acc, duration) => acc + duration, 0);
  debug("THE END", prettyMs(duration));
  return result;
}

module.exports = updateAllProjects;
