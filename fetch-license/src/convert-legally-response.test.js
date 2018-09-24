const {
  aggregatePackagesByLicense,
  removeRedundantLicenses
} = require("./convert-legally-response");

const response = require("../test/legally-sample/unstated.json");

test("It should format `legally` response for `unstated` package", () => {
  const licenses = aggregatePackagesByLicense(response);
  const expectedResult = {
    MIT: {
      count: 2,
      packages: ["create-react-context@0.1.6", "unstated@2.1.1"]
    }
  };
  expect(licenses).toEqual(expectedResult);
});

test("It should format `legally` package response", () => {
  const useCases = [
    {
      input: {
        a: {
          package: [],
          copying: ["MIT"],
          readme: ["MIT"]
        }
      },
      output: {
        MIT: {
          count: 1,
          packages: ["a"]
        }
      }
    },
    {
      input: {
        a: {
          package: ["ISC"],
          copying: ["MIT", "Apache", "Apache 2.0"],
          readme: ["MIT"]
        },
        b: {
          package: ["MIT"],
          copying: ["MIT"],
          readme: ["MIT"]
        }
      },
      output: {
        MIT: {
          count: 2,
          packages: ["a", "b"]
        },
        ISC: {
          count: 1,
          packages: ["a"]
        },
        "Apache 2.0": {
          count: 1,
          packages: ["a"]
        }
      }
    }
  ];
  useCases.forEach(({ input, output }) => {
    const licenses = aggregatePackagesByLicense(input);
    expect(licenses).toEqual(output);
  });
});

test("It should remove redundant licences", () => {
  const useCases = [
    {
      input: ["MIT", "Apache", "Apache 2.0"],
      output: ["MIT", "Apache 2.0"]
    },
    {
      input: ["MIT", "ISC", "Apache 2.0"],
      output: ["MIT", "ISC", "Apache 2.0"]
    }
  ];
  useCases.forEach(({ input, output }) => {
    const licenses = removeRedundantLicenses(input);
    expect(licenses).toEqual(output);
  });
});
