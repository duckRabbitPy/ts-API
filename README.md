# EffectTS API

<b>API built with EffectTS and Express</b>

## What is Effect?

EffectTS is a library that provides a powerful way to work with systems that can both succeed and fail in different places and in different ways.

The Effect module provides us with an immutable value `Effect<Requirements, Error, Value>` that represents both the success case and the failure case of an operation in its type definition.

These immutable lazy values can be passed around the program so that every operation that requires a success result is guaranteed to have it.

The Effect module has been written to accomodate a functional style of programming, Effect immutable values can be mapped, flatmapped, piped, zipped and composed in numerous ways.

Failure cases that can occur on writing to a database, parsing user input, sending a network request, validating json etc. are omitted from the 'happy path' of pipe operations which means you can code with confidence that your values are correct, possible errors and failures accumulate in the error channel which can be handled separately.

See for example my `getDataEffect`, it is an Effect that if successful will return a Todo or array of Todos or void. I also have the types for all of my potential errors `ParseError | PostgresError | ParameterError | ItemNotFoundError`

I can match on different error cases and return custom error messages. With throw and try..catch there is nothing at all in the function type signature that tells you if that function can throw and what type of error it will throw. With Effect you can know at every point in your system what the success and failure case will be, this makes it easy to write composable, reliable and perfomant systems.

```ts
getDataEffect: Effect.Effect<
  never,
  ParseError | PostgresError | ParameterError | ItemNotFoundError,
  Todo | readonly Todo[] | void
>;
```

### Getting started

1. clone this repository

2. then run `yarn install`

Set up a local postgres database:

In psql terminal

```
CREATE DATABASE effect_pg_test WITH
  OWNER = postgres
  ENCODING = 'UTF8'
  TEMPLATE = template0;
```

```
 CREATE TABLE IF NOT EXISTS todos (
    id serial PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    completed BOOLEAN DEFAULT false )

```

Create a `.env` file with the following:

```
NODE_ENV = development
API_KEY = makeUpALocalAPIKey

```

### Local development

start the server with `yarn dev`

### Tests

run tests with `yarn db:test`

### Deployment

Prior to deployment or during a build pipeline run `yarn build` to create the javascript build files in /dist, this enables deployment on any service that supports Node

test the build with `yarn start`

If you are using a non-local db get the connection string from your provider and set it as an env variable on your deployment server.

PROD_DATABASE_URL= [postgres provider connection string e.g. supabase]
API_KEY= [generate a secure secret api key]

### Misc

If your tests fail ensure that your postgres db has timezone set to UTC

```
\c effect_pg_test

ALTER DATABASE effect_pg_dev SET timezone TO 'UTC';

```

## TODOS API

Available at: https://effect-api.onrender.com/
(note has long cold start as on free tier, once first request is served it runs well 😁 )

set the auth header x-api-key to the API_KEY variable when making requests

<b>base URL: api-v1/todos</b>

Supported methods

```
GET - gets all todos
POST - creates a todo include in your JSON Body {"text: : "[your new todo item text]"}
```

<b>Query parameters:</b>

```
sort_by: [field]
order: asc | desc
[numerical field]: lt | lte | eq | gt | gte
[string field]: contains | startsWith | endsWith | eq
[date field]: eq | before | after
fields: [array of fields]
page_size: number
page_number: number
```

<b>api-v1/todos/:id</b>

```
Supported methods
GET - gets todo with param id
PUT - include in your JSON Body {"text: : "[your new todo item text]"}
DELETE - deletes todo with param id
```
