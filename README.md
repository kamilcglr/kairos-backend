# Backend Kairos

![Statements](https://img.shields.io/badge/Coverage%20test-73.26%25-green.svg?style=flat)
![Functions](https://img.shields.io/badge/functions-74.72%25-green.svg?style=flat)
![Lines](https://img.shields.io/badge/lines-73.4%25-green.svg?style=flat)

### Prerequisites
- Node (https://nodejs.org/en/)
- Git
- PostgresSQL
- MinIO (or any S3 service)

You also need to configure your .env : 

_In order to sign-in and use the token created with spring boot (auth server), use the same JWT secret in you .env._
```
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=<secret_app_key>


JWT_CONFIG_KEY=<same_key_as_spring>

DB_CONNECTION=pg
PG_HOST=<enter_your_db_url>
PG_PORT=<enter_your_db_port>
PG_DB_NAME=kairos-db
PG_USER=kairos
PG_PASSWORD=<enter_your_db_password>
PG_CERT=<enter_your_cert_if_you_want_ssl>

DRIVE_DISK=s3
S3_KEY=<enter_your_s3_key>
S3_SECRET=<enter_your_s3_secret>
S3_BUCKET=<enter_your_s3_bucketname>
S3_REGION=<enter_your_s3_region>
S3_ENDPOINT=<enter_your_s3_endpoint>

```


#### How to build 
```bash
$ npm run build
```

#### How to run in dev
```bash
$ npm run dev
```

#### How to run in production
```bash
$ npm run start
```
