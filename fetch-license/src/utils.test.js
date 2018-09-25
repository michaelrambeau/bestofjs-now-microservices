const { isValidPackageName } = require("./utils");

const validNames = ["react", "nest.js", "@cycle/core", "express-gateway"];
const notValidNames = ["React", "a/b", "../.."];

test("It should be valid package name", () => {
  validNames.forEach(name => {
    const isValid = isValidPackageName(name);
    expect(isValid).toBe(true);
  });
});

test("It should NOT be valid package name", () => {
  notValidNames.forEach(name => {
    const isValid = isValidPackageName(name);
    expect(isValid).toBe(false);
  });
});
