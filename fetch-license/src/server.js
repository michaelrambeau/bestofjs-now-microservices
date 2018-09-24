const express = require("express");
const prettyBytes = require("pretty-bytes");
const Keyv = require("keyv");
const debug = require("debug")("*");

const fetchLicenseData = require("./fetch-license-data");
const fetchIfNeeded = require("./fetch-if-needed");

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}
const uri = process.env.MONGODB_CACHE_URI;
const inMemory = process.env.IN_MEMORY === "1";

const options = {
  collection: "licenses",
  namespace: "licenses",
  // Override the default serializer to make data in MongoDB simpler to read:
  // values as stored as JSON objects instead of strings
  serialize: _ => _
};
const cache = inMemory ? new Keyv() : new Keyv(uri, options);
const maxAgeSeconds = 24 * 3600 * 60; // ms

debug("Starting the app", inMemory ? "[using the in-memory cache]" : "");
const app = express();

function crossDomainMiddleware(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,token");
  next();
}

app.use(crossDomainMiddleware);

app.get("/package", async function(request, response) {
  const { name } = request.query;
  debug(`Fetch license data for "${name}" package...`);
  try {
    const { status, data } = await fetchIfNeeded({
      fetchFn: () => fetchLicenseData(name),
      key: name,
      cache,
      maxAgeSeconds
    });
    debug(`Sending license data`, prettyBytes(JSON.stringify(data).length));
    response.send({ status: "OK", ...data });
  } catch (error) {
    debug(error.message);
    response.status(500).json({ status: "ERROR", error: error.message });
  }
});

app.get("/status", async (req, res) => {
  const result = { status: "OK" };
  res.json(result);
});

const listener = app.listen(PORT, function() {
  debug("Server is listening on port " + listener.address().port);
});
