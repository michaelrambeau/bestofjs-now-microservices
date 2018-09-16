const { packageLicenseOnly, byLicense } = require("./convert-legally-response");

const response = require("../test/legally-sample/unstated.json");

test("It should format `legally` package response", () => {
  const licenses = byLicense(response);
  const expectedResult = {
    MIT: {
      count: 2,
      packages: ["create-react-context@0.1.6", "unstated@2.1.1"]
    },
    ISC: {
      count: 1,
      packages: ["pack-unstated@1.0.0"]
    }
  };
  expect(licenses).toEqual(expectedResult);
});
