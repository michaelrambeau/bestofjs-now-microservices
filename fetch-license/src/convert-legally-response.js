const mapValues = require("lodash.mapvalues");
const flatten = require("lodash.flatten");
const uniq = require("lodash.uniq");

function getAllLicenses(input) {
  const getLicenseList = packageInput =>
    uniq(flatten(Object.values(packageInput)));
  return mapValues(input, getLicenseList);
}

function aggregatePackagesByLicense(input) {
  const packages = getAllLicenses(input);
  return Object.keys(packages).reduce((acc, packageName) => {
    const licenses = packages[packageName].map(license => ({
      packageName,
      license
    }));
    return licenses.reduce(byLicense, acc);
  }, {});
}

const byLicense = (acc, { license, packageName }) => {
  const count = acc[license] ? acc[license].count + 1 : 1;
  const packages = acc[license]
    ? acc[license].packages.concat(packageName)
    : [packageName];
  return { ...acc, [license]: { count, packages } };
};

function getAllPackages(input) {
  return Object.keys(input);
}

module.exports = {
  getAllLicenses,
  getAllPackages,
  aggregatePackagesByLicense
};
