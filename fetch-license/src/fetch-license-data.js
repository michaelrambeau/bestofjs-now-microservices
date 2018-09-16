const legally = require("legally");
const mapValues = require("lodash.mapvalues");

async function fetchLicenseData(packageName) {
  const result = await legally(packageName);
  const packages = packageLicenseOnly(result);
  const report = byLicense(result);
  return { report, packages };
}

module.exports = fetchLicenseData;

function packageLicenseOnly(input) {
  return mapValues(input, value => value.package);
}

function byLicense(input) {
  const packages = packageLicenseOnly(input);
  return Object.keys(packages).reduce((acc, packageName) => {
    const licenses = packages[packageName];
    return licenses.reduce(reducer, acc);
  }, {});
}

const reducer = (acc, license) => {
  const count = acc[license] ? acc[license] + 1 : 1;
  return { ...acc, [license]: count };
};
