# `get-github-readme` microservices

An Express web server that fetches the README file for a given Github project, calling Github API.

The application applies several transformations to be able to display the html from any page:

* replace relative anchor link URL
* replace links to repository files
* replace relative image URL
* remove self closed anchors
* Remove anchors automatically created for all titles

## Local development

Launch the web server

```
npm start
```

Go to the following URL to check the response:

http:/localhost:3000?url=https://github.com/camwiegert/in-view

## Deploy

```
npm run deploy
```

The server will be deployed and a new URL will be available.
For example: https://get-github-readme-iphlexqbjp.now.sh?url=https://github.com/camwiegert/in-view

## Tests

Requirement: `tape` testing framework has be installed globally.

We don't include `tape` package in `devDependencies`, otherwise `now.sh` will install it too when it runs `npm install`.

```
npm test
```
