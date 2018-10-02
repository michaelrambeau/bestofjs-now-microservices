const mapValues = require("lodash.mapvalues");
const flatten = require("lodash.flatten");
const uniq = require("lodash.uniq");

const getVersion = (packageName, response) => {
  const packageNameVersion = Object.keys(response).find(p =>
    p.startsWith(`${packageName}@`)
  );
  if (!packageNameVersion) return null;
  const re = /(.*)@(.*)$/;
  const [_, nameOnly, versionOnly] = re.exec(packageNameVersion); //eslint-disable-line no-unused-vars
  return versionOnly;
};

function getAllLicenses(input) {
  const getLicenseList = packageInput =>
    removeRedundantLicenses(uniq(flatten(Object.values(packageInput))));
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

function removeRedundantApacheLicenses(licenses) {
  const isApache = license => /Apache/i.test(license);
  const count = licenses.filter(isApache).length;
  const isRedundant = license => count > 1 && license === "Apache";
  return licenses.filter(license => !isRedundant(license));
}

function removeRedundantLicenses(licenses) {
  const isLinkToLicenseFile = license =>
    /SEE LICENSE IN LICENSE/i.test(license);
  const cleanedLicenses = licenses.filter(
    license => !isLinkToLicenseFile(license)
  );
  return removeRedundantApacheLicenses(cleanedLicenses);
}

module.exports = {
  getAllLicenses,
  getAllPackages,
  aggregatePackagesByLicense,
  removeRedundantLicenses,
  getVersion
};
