const { aggregatePackagesByLicense } = require("./convert-legally-response");

const response = require("../test/legally-sample/unstated.json");

test("It should format `legally` response for `unstated` package", () => {
  const licenses = aggregatePackagesByLicense(response);
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
        copying: ["MIT"],
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
      }
    }
  }
];

test("It should format `legally` package response", () => {
  useCases.forEach(({ input, output }) => {
    const licenses = aggregatePackagesByLicense(input);
    expect(licenses).toEqual(output);
  });
});
