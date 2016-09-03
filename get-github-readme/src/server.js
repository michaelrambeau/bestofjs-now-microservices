require('../setup')

const PORT = 3000

const webtask = require('./get-github-readme')
const context = {
  data: {
    username: process.env.GITHUB_USERNAME,
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET
  }
}

const Express = require('express')
const app = Express()

app.get('/', function (req, res) {
  console.log('query', req.query)
  const url = req.query.url
  if (!url) return res.status(500).json({ error: 'Specify the `?url=` querystring parameter' })
  context.data.url = url
  console.log('Starting the webtask')
  webtask(context, function (err, result) {
    if (err) {
      console.log(err)
      res.status(500).json({ error: err.message })
    } else {
      const html = result.readme
      console.log('README length', html.length)
      res.send(html)
    }
  })
})

console.log('Express server listening on port', PORT)
app.listen(PORT)
