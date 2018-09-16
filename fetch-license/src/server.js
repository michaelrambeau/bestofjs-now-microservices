const express = require("express");
const prettyBytes = require("pretty-bytes");
const debug = require("debug")("*");

const fetchLicenseData = require("./fetch-license-data");

const PORT = process.env.PORT || 3001;

const app = express();

function crossDomainMiddleware(req, res, next) {
  const maxAge = 2 * 3600; // cache results in the browser for 2 hours
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,token");
  res.header("Cache-Control", `max-age=${maxAge}`);
  next();
}

app.use(crossDomainMiddleware);

app.get("/:packageName", async function(request, response) {
  const { packageName } = request.params;
  debug(`Fetch license data for "${packageName}" package...`);
  try {
    const license = await fetchLicenseData(packageName);
    debug(`Sending license data`, prettyBytes(JSON.stringify(license).length));
    response.send({ status: "OK", ...license });
  } catch (error) {
    debug(error.message);
    response.status(500).json({ status: "ERROR", error: error.message });
  }
});

const listener = app.listen(PORT, function() {
  debug("Server is listening on port " + listener.address().port);
});
