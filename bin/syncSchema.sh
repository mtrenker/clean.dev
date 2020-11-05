#!/bin/sh

aws appsync get-introspection-schema --api-id mb55l2kcmzezjhbzpgr5vj4wfa --format SDL ./src/graphql/schema.graphql --profile clean-prod
sed -i '1s;^;scalar AWSDate\nscalar AWSDateTime\n;' ./src/graphql/schema.graphql
