import { parse } from 'url';
import Auth from '@aws-amplify/auth';
import { HmacSHA256 } from 'crypto-js';
import { formatISO } from 'date-fns';

const getSignKey = (key: string, dateStamp: string, regionName: string, serviceName: string) => {
  const kDate = HmacSHA256(dateStamp, `AWS4${key}`);
  const kRegion = HmacSHA256(regionName, kDate);
  const kService = HmacSHA256(serviceName, kRegion);
  const kSigning = HmacSHA256('aws4_request', kService);
  return kSigning;
};

const date = formatISO(new Date());

const getCanonicalRequest = (url: string, options: any) => {
  const renderHeaders = (headers: {[key: string]: string}): string => Object.keys(headers).reduce(
    (prev, cur) => `${prev}${prev !== '' ? '\n' : ''}${cur}: ${headers[cur]}`, '',
  );
  const { host, path } = parse(url);
  const canonicalRequest = `${options.method}
  ${path}
  ${renderHeaders(options.headers)}
  host:${host}
  x-amz-date:${date}
  `;
  return canonicalRequest;
};

const sign = (url: string, options: any, credentials: any) => {
  const signKey = getSignKey(credentials.secretAccessKey, '20200927', 'eu-west-1', 'appsync');
  const canonicalRequest = getCanonicalRequest(url, options);
  const signature = HmacSHA256(signKey.toString(), canonicalRequest);
  const signedHeaders = 'host;x-amz-date;content-type';
  const credential = `${credentials.secretAccessKey}/20200927/eu-west-1/appsync/aws4_request`;
  // eslint-disable-next-line max-len
  const header = `AWS-4-HMAC-SHA256 Credential=${credential}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  console.log(header);
  return header;

  // console.log(signKey.toString(), canonicalRequest, options, credentials);
};

export const signedFetch = async (url: string, options: any): Promise<Response> => {
  const credentials = await Auth.currentCredentials();
  const authHeader = sign(url, options, credentials);

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: authHeader,
      'X-Amz-Date': date,
    },
  });
};
