# URL shortener API

This API provides some simple functionality to shorten URLs

It's deployed on [http://tinytinylink.herokuapp.com](http://tinytinylink.herokuapp.com)

## Build

To start the typescript compiler in watch mode run

```
yarn watch
```

You can also build it once with

```
yarn build
```

## Start the API

To start the API run

```
yarn start
```

You will need some ENV variables:

* PORT - specifies the APIs port. Defaults to 3000.
* MONGODB_CONNECTION_STRING - DB connection string.

## Endpoints

### GET /top

Returns a list of the top most visited URLs.

Accepts query parameter `count`, defaults to 100.

### GET /:shortUrl

Redirects to the original URL

### POST /url

Returns the asociated short URL (encodes and stores the original one if not available).

request body should be a json like:

```json
{
    "url": "some.url/which-is-very-long"
}
```