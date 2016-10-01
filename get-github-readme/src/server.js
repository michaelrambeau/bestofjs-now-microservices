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

function crossDomainMiddleware (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,token')
  res.header('Cache-Control', 'max-age=7200')
  next()
}

app.use(crossDomainMiddleware)

app.get('/:userName/:repoName', function (req, res) {
  console.log('query', req.query)
  const { userName, repoName } = req.params
  // const repo = req.query.repo
  const repo = `${userName}/${repoName}`
  if (!repo) return res.status(500).json({ error: 'Specify the `?repo=` querystring parameter' })
  context.data.repo = repo
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
