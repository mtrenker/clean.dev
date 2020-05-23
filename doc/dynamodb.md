# DynamoDB Architecture

The goal of clean.dev is to use only one DynamoDB table to store all the data for the website.

This document describes how to write and read data to and from the table to ensure consistent and performant access.

## Table Design

The access patterns follow the [Adjacency List Design Pattern](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-adjacency-graphs.html#bp-adjacency-lists).

For the partition key, we use keys that ensure our data is spread out evenly to avoid bottlenecks at the partition level.
Most of the times, this will be a user id.

`user-1234` means entity `user` with ID `1234`.

| PK             | SK                                      | Data...                                  | *Note*                                      |
|----------------|-----------------------------------------|------------------------------------------|---------------------------------------------|
| user_1234      | tracking_1234_2020-05-23T08:00:00.000Z  | {startTime, endTime, description}        | individual tracking object                  |

## Access Patterns

Given the table design above, here are some access patterns:

<dl>
  <dt>Query all tracking documents for project <em>1234</em></dt>
  <dd>
    Query: <code>PK = "user_1234" and begins_with(SK, "tracking_1234")</code>
  </dd>
  <dt>Query all tracking documents for project <em>1234</em> in <em>2020</em></dt>
  <dd>
    Query: <code>PK = "user_1234" and begins_with(SK, "tracking_1234_2020")</code>
  </dd>
  <dt>Query all tracking documents for project <em>1234</em> for <em>May 2020</em></dt>
  <dd>
    Query: <code>PK = "user_1234" and begins_with(SK, "tracking_1234_2020_05")</code>
  </dd>
  <dt>Query all tracking documents for project <em>1234</em> for <em>May 23rd 2020</em></dt>
  <dd>
    Query: <code>PK = "user_1234" and begins_with(SK, "tracking_1234_2020_05_23")</code>
  </dd>
</dl>

### Acknowledgements

In certain cases it makes sens to accumulate common access patterns into separate projections, for example:

| PK             | SK                                      | Data...                                  | *Note*                                      |
|----------------|-----------------------------------------|------------------------------------------|---------------------------------------------|
| user_1234      | tracking_1234_2020-05-23T08:00:00.000Z  | {startTime, endTime, description}        | individual tracking object                  |
| user_1234      | tracking_1234_2020-05-23                | [{startTime, endTime, description}, ...] | all tracking entries for may 23rd 2020      |
| user_1234      | tracking_1234_2020-05                   | [{startTime, endTime, description}, ...] | all tracking entries for may 2020           |
| user_1234      | tracking_1234_2020                      | [{startTime, endTime, description}, ...] | all tracking entries for 2020               |

Let's say we have 4 tracking records per day and 20 days per month, if we want to print a report of all trackings for a month,
this would mean *20 days* x *4 trackings* = **80** read ops compared to one `PK = "user-1234" and begins_with(SK, "tracking-1234-2020-05")`

## Data Flow

To ensure a predictable and durable data storage, we use a few AWS services, including:

* AppSync: As the API Gateway for queries and mutations, using either [vtl resolvers](../cdk/resources/vtl/trackingQuery.vtl)
or [lambda functions](../cdk/resources/lambda/tracking-mutation/mutation.ts)
* Lambda: More complex operations like storing data will be handled by lambdas that publish success and error cases to an SNS topic
* SNS / SQS: The pub/sub approach is a durable way of communicating between micro services - no direct communication between services!
* S3: Everything that happens in our application should be stored in S3 in a way that allows us to reconstruct the whole application state and as a data lake
