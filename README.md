Express Mock App
==========

This is a mocker app built using [express.js](https://expressjs.com/) to support the initial works of my Android projects.

Let's get started
----
`nodemon` redeploys the file in server when the source code changes. Thus we don't have to manually restart the server again and again

**Environment**

Node version `18.12.0`


Installing **Nodemon**
----
Just use *nodemon* instead of node to run your code, and now your process will automatically restart when your code changes. To install, get node.js, then from your terminal run:

`npm install -g nodemon`

Running the server in dev mode
----
`yarn startDev`


## Mock cURLs
1. Login
```curl --location --request POST 'http://localhost:8080/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "password": "1234"
}'
```

2. Logout
```
curl --location --request POST 'http://localhost:8080/logout' \
--header 'Content-Type: application/json'
```

3. Dashboard
```
curl --location --request GET 'http://localhost:8080/dashboard.html'
```