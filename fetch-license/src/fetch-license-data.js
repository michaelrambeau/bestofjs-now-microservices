const legally = require("legally");
const debug = require("debug")("legally");

const {
  aggregatePackagesByLicense,
  getAllPackages,
  getVersion
} = require("./convert-legally-response");

async function fetchLicenseData(packageName) {
  const t0 = new Date();
  const result = await legally(packageName);
  const t1 = new Date();
  const duration = t1 - t0;
  debug(result);
  const licenses = aggregatePackagesByLicense(result);
  const packages = getAllPackages(result);
  const version = getVersion(packageName, result);
  const meta = {
    name: packageName,
    version: version,
    date: t0,
    duration,
    count: packages.length,
    licenses: Object.keys(licenses)
  };
  return { meta, licenses, packages };
}

module.exports = fetchLicenseData;
