const fetch = require('node-fetch')
const DEBUG = false // use to display console debug messages

/*
The main function run by the microservice
*/

module.exports = function (context, done) {
  // Define an helper to send the error message
  var sendError = function (msg) {
    done(new Error(msg))
  }

  // Check the input
  var repo = context.data.repo
  if (!repo) return sendError('No `repo` parameter')

  // Check if credentials are provided
  var credentials = {
    username: context.data.username,
    client_id: context.data.client_id,
    client_secret: context.data.client_secret
  }
  if (!credentials.username) return sendError('No Github credentials `username`')
  if (!credentials.client_id) return sendError('No Github credentials `client_id`')
  if (!credentials.client_secret) return sendError('No Github credentials `client_secret`')

  const options = {
    credentials
  }
  getReadMe(repo, options, function (err, readme) {
    if (err) console.log(err)
    var result = {
      readme: readme
    }
    done(err, result)
  })
}

// Generic function to make a Github request for a given repository
// Parameters:
// - repo: full URL of the Github repository
// - path (optional): added to the repository (ex: '/readme')
const githubRequest = function (repo, path, options, cb) {
  const { credentials } = options
  // let url = repo.replace(/https:\/\/github.com/, 'https://api.github.com/repos')
  let url = `https://api.github.com/repos/${repo}`
  url = `${url}${path}?client_id=${credentials.client_id}&client_secret=${credentials.client_secret}`
  var requestOptions = {
    headers: {
      'User-Agent': credentials.username,
      'Accept': 'application/vnd.github.VERSION.html'
    }
  }
  console.log('Github request', requestOptions)
  fetch(url, requestOptions)
    .then(res => res.text())
    .then(body => cb(null, body))
    .catch(e => cb(new Error('Invalid response from Github for url ' + url)))
}

const getGithubReadme = function (project, options, cb) {
  githubRequest(project, '/readme', options, function (err, text) {
    if (err) {
      return cb(err)
    } else {
      return cb(null, text)
    }
  })
}

var getReadMe = function (repo, options, cb) {
  getGithubReadme(repo, options, function (err, readme) {
    if (err) return cb(err)

    var root = `https://github.com/${repo}`

    // STEP1: replace relative anchor link URL
    // [Quick Start](#quick-start) => [Quick Start](https://github.com/node-inspector/node-inspector#quick-start)"
    readme = readme.replace(/<a href="#([^"]+)">/gi, function (match, p1) {
      if (DEBUG) console.log('Replace link relative anchors', p1)
      return `<a href="${root}#${p1}">`
    })
    // STEP2: replace links to repository files
    // Example 1: rom react-router <a href="/docs">
    // [Guides and API Docs](/docs) => [Guides and API Docs](https://github.com/rackt/react-router/tree/master/docs)"
    // Example 2: from acdlite/recompose: <a href="docs">
    readme = readme.replace(/<a href="\/*(.+?)">/gi, function (match, p1) {
      // If the URL starts with http => do nothing
      if (p1.indexOf('http') === 0) return match
      if (DEBUG) console.log('Replace link relative URL', p1)
      return `<a href="${root}/blob/master/${p1}">`
    })

    // STEP3: markdown images seen on https://github.com/MostlyAdequate/mostly-adequate-guide
    //! [cover](images/cover.png)] => ![cover](https://github.com/MostlyAdequate/mostly-adequate-guide/raw/master/images/cover.png)
    readme = readme.replace(/!\[(.+?)\]\(\/(.+?)\)/gi, function (match, p1, p2) {
      if (DEBUG) console.log('Replace md image relative URL', p1)
      return `[${p1}](${root}/blob/master/${p2})`
    })

    // STEP4: replace relative image URL
    readme = readme.replace(/src="(.+?)"/gi, function (match, p1) {
      if (DEBUG) console.log('Replace image relative URL', p1)
      return `src="${getImagePath(root, p1)}"`
    })

    // STEP5: remove self closed anchors (seen on async repo)
    // the regexp matches: <a name=\"forEach\"> and <a name="forEach">
    readme = readme.replace(/<a name=\\?"(.+?)\\?" \/>/gi, function () {
      if (DEBUG) console.log('Remove self closed anchor')
      return ''
    })
    // matches <a name="constant">
    readme = readme.replace(/<a name="(.+?)">/gi, function () {
      if (DEBUG) console.log('Remove anchor')
      return ''
    })

    // Remove anchors automatically created for all titles
    // <a id="user-content-react-toolbox" class="anchor" href="#react-toolbox" aria-hidden="true">
    //   <span class="octicon octicon-link"></span>
    // </a>
    readme = readme.replace(/<a id="user-content(.*)" class="anchor" (.*?)>(.*?)<\/a>/gi, function () {
      if (DEBUG) console.log('Remove title anchor')
      return ''
    })

    cb(null, readme)
  })
}

// Replace relative URL by absolute URL
function getImagePath (root, url) {
  var path = url

  // If the URL is absolute (start with http), we do nothing...
  if (path.indexOf('http') === 0) return path

  // Special case: in Faceboox Flux readme, relative URLs start with './'
  // so we just remove './' from the UL
  if (path.indexOf('./') === 0) path = path.replace(/.\//, '')

  // ...otherwise we create an absolute URL to the "raw image
  // example: images in "You-Dont-Know-JS" repo.
  return root + '/raw/master/' + path
}
