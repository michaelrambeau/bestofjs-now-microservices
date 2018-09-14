// Test the content returned by the "get-github-readme" microservice.
const test = require("tape");
require("../setup");
const fetchReadme = require("../src/fetch-github-readme");

const repos = [
  "caolan/async",
  "node-inspector/node-inspector",
  "facebook/flux",
  "rackt/react-router",
  "MostlyAdequate/mostly-adequate-guide",
  "aerojs/aero",
  "sindresorhus/ky"
];
repos.forEach(getReadme);

function getReadme(repo) {
  test(`Checking response from ${repo}`, async assert => {
    const credentials = {
      username: process.env.GITHUB_USERNAME,
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET
    };
    try {
      const readme = await fetchReadme({ repo, credentials });
      assert.ok(
        readme.length > 1000,
        "There should be a response whose length is > 1000"
      );
      assert.end();
    } catch (err) {
      console.log(err);
      assert.fail(err.message);
      assert.end();
    }
  });
}
