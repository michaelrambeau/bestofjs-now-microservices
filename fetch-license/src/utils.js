const validate = require("validate-npm-package-name");

// const isNormalPackageName = name => /^[a-z0-9-]+$/.test(name);

// const isScopedPackageName = name => /^@[a-z0-9-]+\/[a-z0-9-]+$/.test(name);

function isValidPackageName(name) {
  // return isNormalPackageName(name) || isScopedPackageName(name);
  return validate(name).validForNewPackages;
}

module.exports = { isValidPackageName };
