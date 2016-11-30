// Test the content returned by the "get-github-readme" microservice.
const test = require('tape')
require('../setup')

const repos = [
  'caolan/async',
  'node-inspector/node-inspector',
  'facebook/flux',
  'rackt/react-router',
  'MostlyAdequate/mostly-adequate-guide',
  'aerojs/aero'
]
repos.forEach(repo => getReadme(repo))

function getReadme (repo) {
  test(`Checking response from ${repo}`, assert => {
    const webtask = require('../src/get-github-readme')
    const context = {
      data: {
        repo,
        username: process.env.GITHUB_USERNAME,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET
      }
    }

    webtask(context, function (err, result) {
      if (err) {
        console.log(err)
        assert.fail(err.message)
      } else {
        const readme = result.readme
        assert.ok(readme.length > 1000, 'There should be a response whose length is > 1000')
      }
      assert.end()
    })
  })
}
