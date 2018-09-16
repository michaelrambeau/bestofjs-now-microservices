# Best of JavaScript microservices

This repository contains source code for Best of JavaScript microservices deployed using [zeit.co/now](https://zeit.co/now).

* `get-github-readme`: fetch and format the README.md for a given package on GitHub
* `fetch-license`: fetch data about license for a given package and all its dependencies

How to deploy:

install `now` globally

```
npm install now
```

Login

```
npm --login
```

Store secret variables

```
now secret add GITHUB_CLIENT_ID ***
now secret add GITHUB_CLIENT_SECRET ***
now secret add GITHUB_USERNAME ***
```

Deploy the service, from every service folder:

```
npm run deploy
```
