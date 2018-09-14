# Best of JavaScript microservices

This repository contains source code for microservices deployed using [zeit.co/now](https://zeit.co/now).

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
