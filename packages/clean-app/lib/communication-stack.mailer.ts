import { AppSyncResolverEvent } from 'aws-lambda';
import { SES } from 'aws-sdk';

interface Message {
  name?: string;
  email: string;
  message: string;
}

export const handler = async (event: AppSyncResolverEvent<Message>) => {
  const ses = new SES();
  await ses.sendEmail({
    Source: 'Clean',
    Destination: {
      ToAddresses: [process.env.MAIL_TO as string],
    },
    Message: {
      Body: {
        Text: {
          Data: event.arguments.message,
        },
      },
      Subject: {
        Data: `${event.arguments.name} (${event.arguments.email})`,
      },
    },
  }).promise();
  return '';
};
