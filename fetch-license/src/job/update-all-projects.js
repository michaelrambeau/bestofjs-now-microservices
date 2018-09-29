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
const { buildMetaLocalCache } = require("../cache");

const isError = item => item.status === "ERROR";
const isOK = item => !isError(item);

async function updateAllProjects({ cache, limit, maxAgeSeconds, dryRun }) {
  debug("Building the local cache of meta data");
  const localCache = await buildMetaLocalCache(cache);
  debug("Local cache built", localCache.size, "entries");
  debug("Fetching all projects...");
  const { featured, popular, trending } = await fetchProjects();
  const candidates = uniq([].concat(featured, popular, trending)).slice(
    0,
    1000
  );
  debug("Checking the cache");
  const packagesWithCacheData = await pMap(
    candidates,
    addCacheData(localCache),
    {
      concurrency: 10
    }
  );
  debug("Packages to check", candidates.length);
  const toBeUpdated = packagesWithCacheData.filter(needUpdate).slice(0, limit);
  debug("Packages to update", toBeUpdated.length, toBeUpdated.map(p => p.key));
  const update = dryRun
    ? item => () => Promise.resolve(item)
    : ({ key }) => () =>
        processSinglePackage({ cache, packageName: key, maxAgeSeconds });
  const tasks = toBeUpdated.map(update);
  const result = await pSeries(tasks);
  const compactLog = item => {
    const {
      meta: { name, version, count, duration }
    } = item;
    return [name, version, count, prettyMs(duration)];
  };
  const fullLog = item => item.meta;
  const log = result.length > 10 ? compactLog : fullLog;
  debug(dryRun ? result : result.filter(isOK).map(log));
  const duration = dryRun
    ? 0
    : result
        .filter(isOK)
        .map(item => item.meta.duration)
        .reduce((acc, duration) => acc + duration, 0);
  const packageErrors = result.filter(isError).map(item => item.meta.name);
  const errorCount = packageErrors.length;
  debug(
    "THE END",
    `${result.length} packages processed in ${prettyMs(duration)}`,
    errorCount ? `${errorCount} errors` : "No error",
    packageErrors
  );
  return result;
}

const processSinglePackage = async ({ packageName, cache, maxAgeSeconds }) => {
  debug("Fetching", packageName);
  try {
    // we need to `await` here, otherwise errors are not trapped at this level
    return await fetchLicenseAndUpdateCache({
      packageName,
      cache,
      maxAgeSeconds
    });
  } catch (error) {
    debug(error);
    return { status: "ERROR", meta: { name: packageName } };
  }
};

module.exports = updateAllProjects;
