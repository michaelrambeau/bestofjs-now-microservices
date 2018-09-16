const legally = require("legally");
const debug = require("debug")("legally");

const { byLicense } = require("./convert-legally-response");

async function fetchLicenseData(packageName) {
  const result = await legally(packageName);
  debug(result);
  const licenses = byLicense(result);
  return { licenses };
}

module.exports = fetchLicenseData;
