const express = require("express");
const prettyBytes = require("pretty-bytes");
const debug = require("debug")("*");

const fetchLicenseData = require("./fetch-license-data");

const PORT = process.env.PORT || 3001;

const app = express();

app.get("/:packageName", async function(request, response) {
  const { packageName } = request.params;
  debug(`Fetch license data ${packageName}`);
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
