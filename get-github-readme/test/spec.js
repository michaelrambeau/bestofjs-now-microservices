// Test the content returned by the "get-github-readme" microservice.
const test = require('tape')
require('../setup')

const urls = [
  'https://github.com/caolan/async',
  'https://github.com/node-inspector/node-inspector',
  'https://github.com/facebook/flux',
  'https://github.com/rackt/react-router',
  'https://github.com/MostlyAdequate/mostly-adequate-guide'
]
urls.forEach(url => getReadme(url))

function getReadme (url) {
  test('Checking response from ' + url, assert => {
    const webtask = require('../src/get-github-readme')
    const context = {
      data: {
        url,
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
