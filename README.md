# Microservices deployed on zeit.co/now

This repository contains source code for microservices deployed using [zeit.co/now](https://zeit.co/now) service.

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

Deploy the service, from the microservice folder:

```
npm run deploy
```
