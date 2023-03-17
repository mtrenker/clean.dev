import { APIGatewayProxyHandler } from 'aws-lambda';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { Configuration, OpenAIApi } from 'openai';
import { default as fetch, Request } from 'node-fetch';
import { SecretsManager } from 'aws-sdk';

const secretsManager = new SecretsManager();

export const handler: APIGatewayProxyHandler = async (event) => {
  const openApiKey = await secretsManager.getSecretValue({ SecretId: 'openai/api-key' }).promise();
  const hygraphApiEndpoint = await secretsManager.getSecretValue({ SecretId: 'hygraph/api-url' }).promise();
  const hygraphApiToken = await secretsManager.getSecretValue({ SecretId: 'hygraph/api-token' }).promise();

  const configuration = new Configuration({
    apiKey: openApiKey.SecretString,
  });

  console.log(JSON.stringify(event));

  const { body } = event;

  if (!body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'No body',
      }),
    };
  }

  const { data } = JSON.parse(body);

  const openai = new OpenAIApi(configuration);
  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: data.prompt,
    temperature: 0.6,
  });

  const message = completion.data.choices[0].text;

  const endpoint = new URL(hygraphApiEndpoint.SecretString ?? '');

  const query = /* GraphQL */ `
    mutation updatePost($data: PostUpdateInput!, $where: PostWhereUniqueInput!) {
      updatePost(data: $data, where: $where)
    }
  `;

  const variables = {
    data: {
      content: {
        children: [
          {
            type:'paragraph',
            children:[
              {
                text: message,
              },
            ],
          },
        ],
      },
    },
    where: {
      id: data.id,
    },
  };

  const updateRequest = new HttpRequest({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      host: endpoint.host,
      'Authorization': `Bearer ${hygraphApiToken.SecretString}`,
    },
    hostname: endpoint.host,
    body: JSON.stringify({ query, variables }),
    path: endpoint.pathname,
  });

  const request = new Request(endpoint, updateRequest);

  let statusCode = 200;
  let responseBody;
  let response;

  try {
    response = await fetch(request);
    responseBody = await response.json();
    if (responseBody.errors) statusCode = 400;
  } catch (error) {
    statusCode = 500;
    responseBody = {
      errors: [
        {
          message: (error as Error).message,
        },
      ],
    };
  }

  return {
    statusCode,
    body: JSON.stringify(body),
  };
};
