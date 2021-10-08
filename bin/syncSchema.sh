#!/bin/sh

aws appsync get-introspection-schema --api-id $1 --format SDL ./src/graphql/schema.graphql --profile $2
sed -i '1s;^;scalar AWSDate\nscalar AWSDateTime\n;' ./src/graphql/schema.graphql
