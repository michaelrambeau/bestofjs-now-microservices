const express = require("express");
const prettyBytes = require("pretty-bytes");
const debug = require("debug")("*");
// const apicache = require("apicache");
// const routeCache = require("route-cache");
const Keyv = require("keyv");

const fetchLicenseData = require("./fetch-license-data");
const fetchIfNeeded = require("./fetch-if-needed");

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}
const uri = process.env.MONGODB_CACHE_URI;
const keyv = new Keyv(uri, { collection: "licenses", namespace: "" });

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
      cache: keyv
    });
    debug(`Sending license data`, prettyBytes(JSON.stringify(data).length));
    response.send({ status: "OK", ...data });
  } catch (error) {
    debug(error.message);
    response.status(500).json({ status: "ERROR", error: error.message });
  }
});

app.get("/status", (req, res) => {
  const result = { status: "OK" };
  res.json(result);
});

const listener = app.listen(PORT, function() {
  debug("Server is listening on port " + listener.address().port);
});
