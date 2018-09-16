const mapValues = require("lodash.mapvalues");

function packageLicenseOnly(input) {
  return mapValues(input, value => value.package);
}

function byLicense(input) {
  const packages = packageLicenseOnly(input);
  return Object.keys(packages).reduce((acc, packageName) => {
    const licenses = packages[packageName].map(license => ({
      packageName,
      license
    }));
    return licenses.reduce(reducer, acc);
  }, {});
}

const reducer = (acc, { license, packageName }) => {
  const count = acc[license] ? acc[license].count + 1 : 1;
  const packages = acc[license]
    ? acc[license].packages.concat(packageName)
    : [packageName];
  return { ...acc, [license]: { count, packages } };
};

module.exports = {
  packageLicenseOnly,
  byLicense
};
