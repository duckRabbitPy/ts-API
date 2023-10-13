# EffectTS API

<b>API built with EffectTS and Express</b>

### Getting started

1. clone this repository

2. make sure you have bun https://bun.sh/ installed

3. then run `bun install`

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
          completed BOOLEAN DEFAULT false
        )

```

Create a `.env` file with the following:

```
NODE_ENV = development
HOST = localhost
TZ = UTC
TEST_PG_NAME = effect_pg_test
TEST_PG_PASSWORD= postgres
API_KEY = [create random api key for local dev]

PROD_DATABASE_URL= [postgres provider connection string e.g. supabase]
```

### Local development

start the server with `bun dev`

### Tests

run tests with `bun db:test`

### Deployment

Prior to deployment run `bun tsc` or `npx tsc` to create the javascript build files in /dist, this enables deployment on any service that supports Node

test the build with `node start`

### Misc

If your tests fail ensure that your postgres db has timezone set to UTC

```
\c effect_pg_test

ALTER DATABASE effect_pg_dev SET timezone TO 'UTC';

```

## TODOS API

set the auth header x-api-key to the API_KEY variable when making requests

<b>base URL: api-v1/todos</b>

Supported methods

```
GET - gets all todos
POST - creates a todo include in your JSON Body {"text: : "[your new todo item text]"}
```

<b>Query parameters:</b>

```
sortBy: [field]
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
