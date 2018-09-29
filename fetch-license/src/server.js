const express = require("express");
const prettyBytes = require("pretty-bytes");
const prettyMs = require("pretty-ms");
const debug = require("debug")("*");

const fetchLicenseData = require("./fetch-license-data");
const fetchIfNeeded = require("./fetch-if-needed");
const { createCache, findAll } = require("./cache");
const { isValidPackageName } = require("./utils");
const updateAllProjects = require("./job/update-all-projects");

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}
const uri = process.env.MONGODB_CACHE_URI;
const inMemory = process.env.IN_MEMORY === "1";
const cache = createCache({ inMemory, uri });
const maxAgeSeconds = 10 * 24 * 60 * 60; // 10 days

debug("Starting the app", inMemory ? "[using the in-memory cache]" : "");
const app = express();

function crossDomainMiddleware(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,token");
  next();
}

app.use(crossDomainMiddleware);

/*
Fetch license data about a given package, running `legally`
*/
app.get("/package", async function(request, response) {
  const { name, skipCache } = request.query;
  try {
    if (!isValidPackageName(name)) throw new Error("Invalid package name!");
    debug(`Fetch license data for "${name}" package...`);
    const { status, data } = await fetchIfNeeded({
      fetchFn: () => fetchLicenseData(name),
      key: name,
      cache,
      maxAgeSeconds,
      skipCache
    });
    debug(`Sending license data`, prettyBytes(JSON.stringify(data).length));
    response.send({ status: "OK", ...data });
  } catch (error) {
    debug(error.message);
    response.status(500).json({ status: "ERROR", error: error.message });
  }
});

app.delete("/package", async function(request, response) {
  const { name } = request.query;
  try {
    if (!isValidPackageName(name)) throw new Error("Invalid package name!");
    debug(`Deleting "${name}" package from the cache...`);
    await cache.delete(name);
    debug("Deleted");
    response.send({ status: "OK" });
  } catch (error) {
    debug(error.message);
    response.status(500).json({ status: "ERROR", error: error.message });
  }
});

/*
The simplest route to check that the server is running
*/
app.get("/status", async (req, res) => {
  const result = { status: "OK" };
  res.json(result);
});

/*
Route used to check the cache state
*/
app.get("/cache", async (req, res) => {
  const now = new Date();
  const formatCacheEntry = entry => ({
    key: entry.key.split(":")[1],
    expiresIn: prettyMs(new Date(entry.expiresAt) - now),
    duration: prettyMs(entry.value.value.meta.duration),
    count: entry.value.value.meta.count
  });
  debug("Fetching cache entries");
  const result = await findAll(cache);
  const count = result.length;
  debug(count, "entries found");
  const entries = result.map(formatCacheEntry);
  res.json({ count, entries });
});

/*
Route used to check if the periodic job can run on the server
We limit the max number of packages to process to a very low number
*/
app.get("/next-job", async (req, res) => {
  const packages = await updateAllProjects({
    cache,
    limit: 20,
    maxAgeSeconds,
    dryRun: true
  });
  res.json({
    status: "OK",
    message: `${packages.length} packages to update`,
    packages
  });
});

const listener = app.listen(PORT, function() {
  debug("Server is listening on port " + listener.address().port);
});
