import { GraphqlApi, GraphqlType, ObjectType } from '@aws-cdk/aws-appsync-alpha';
import { Construct } from 'constructs';

interface InvoiceProps {
  readonly api: GraphqlApi;
}

export class Invoice extends Construct {
  constructor (scope: Construct, id: string, props: InvoiceProps) {
    super(scope, id);
    const { api } = props;

    const contactType = new ObjectType('InvoiceContact', {
      definition: {
        company: GraphqlType.string(),
        firstName: GraphqlType.string(),
        lastName: GraphqlType.string(),
        street: GraphqlType.string(),
        city: GraphqlType.string(),
        state: GraphqlType.string(),
        zip: GraphqlType.string(),
        vat: GraphqlType.string(),
        email: GraphqlType.string(),
        website: GraphqlType.string(),
        bank: GraphqlType.string(),
        iban: GraphqlType.string(),
        bic: GraphqlType.string(),
      },
    });
    api.addType(contactType);

    const invoicePosition = new ObjectType('InvoicePosition', {
      definition: {
        description: GraphqlType.string(),
        quantity: GraphqlType.float(),
        tax: GraphqlType.float(),
        unitPrice: GraphqlType.float(),
      },
    });
    api.addType(invoicePosition);

    const invoiceType = new ObjectType('Invoice', {
      definition: {
        vendor: contactType.attribute({ isRequired: true }),
        client: contactType.attribute({ isRequired: true }),
        number: GraphqlType.int({ isRequired: true }),
        date: GraphqlType.awsDate({ isRequired: true }),
        deliveryDate: GraphqlType.awsDate({ isRequired: true }),
        dueDate: GraphqlType.awsDate({ isRequired: true }),
        project: GraphqlType.string({ isRequired: true }),
        positions: invoicePosition.attribute({ isRequired: true, isList: true }),
      },
    });
    api.addType(invoiceType);
  }
}
