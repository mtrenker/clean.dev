import { SNS } from 'aws-sdk';

export const handler = async (event: any) => {
  const TOPIC_ARN = process.env.TOPIC_ARN ?? '';
  const TOPIC_REGION = process.env.TOPIC_REGION ?? '';

  const sns = new SNS({
    region: TOPIC_REGION,
  });

  try {
    await sns.publish({
      TopicArn: TOPIC_ARN,
      Message: event.body,
    }).promise();
    return 'ok';
  } catch (error) {
    return 'error';
  }
};
