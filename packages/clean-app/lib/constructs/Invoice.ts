import { GraphqlApi, GraphqlType, InputType, MappingTemplate, ObjectType, ResolvableField } from '@aws-cdk/aws-appsync-alpha';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

interface InvoiceProps {
  api: GraphqlApi;
  table: ITable;
}

export class Invoice extends Construct {
  constructor (scope: Construct, id: string, props: InvoiceProps) {
    super(scope, id);
    const { api, table } = props;

    const dataSource = api.addDynamoDbDataSource('InvoiceDataSource', table);

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

    const contactInputType = new InputType('InvoiceContactInput', {
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
    api.addType(contactInputType);

    const invoicePosition = new ObjectType('InvoicePosition', {
      definition: {
        description: GraphqlType.string(),
        quantity: GraphqlType.float(),
        tax: GraphqlType.float(),
        unitPrice: GraphqlType.float(),
      },
    });
    api.addType(invoicePosition);

    const invoicePositionInput = new InputType('InvoicePositionInput', {
      definition: {
        description: GraphqlType.string(),
        quantity: GraphqlType.float(),
        tax: GraphqlType.float(),
        unitPrice: GraphqlType.float(),
      },
    });
    api.addType(invoicePositionInput);

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

    const invoiceInputType = new InputType('InvoiceInput', {
      definition: {
        vendor: contactInputType.attribute({ isRequired: true }),
        client: contactInputType.attribute({ isRequired: true }),
        number: GraphqlType.int({ isRequired: true }),
        date: GraphqlType.awsDate({ isRequired: true }),
        deliveryDate: GraphqlType.awsDate({ isRequired: true }),
        dueDate: GraphqlType.awsDate({ isRequired: true }),
        project: GraphqlType.string({ isRequired: true }),
        positions: invoicePositionInput.attribute({ isRequired: true, isList: true }),
      },
    });
    api.addType(invoiceInputType);

    api.addMutation('createInvoice', new ResolvableField({
      dataSource,
      returnType: invoiceType.attribute(),
      args: {
        input: invoiceInputType.attribute({ isRequired: true }),
      },
      requestMappingTemplate: MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "operation": "PutItem",
          "key": {
            "pk": $util.dynamodb.toDynamoDBJson($ctx.identity.sub),
            "sk": $util.dynamodb.toDynamoDBJson("INVOICE#" + $args.input.number)
          },
          "attributeValues": $util.dynamodb.toMapValuesJson($util.dynamodb.toMapValues($ctx.args.input))
        }
      `),
    }));

    api.addQuery('getInvoices', new ResolvableField({
      dataSource,
      returnType: invoiceType.attribute({ isList: true, isRequiredList: true }),
      args: {
        date: GraphqlType.awsDate(),
      },
      requestMappingTemplate: MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "operation": "Query",
          "query": {
            "expression": "pk = :pk AND begins_with(sk, :sk)",
            "expressionValues": {
              ":pk": $util.dynamodb.toDynamoDBJson($ctx.identity.sub),
              ":sk": $util.dynamodb.toDynamoDBJson("INVOICE#" + $util.defaultIfNullOrEmpty($ctx.args.date, ""))),
            }
          }
        }
      `),
      responseMappingTemplate: MappingTemplate.fromString(`
        $util.toJson($util.defaultIfNullOrEmpty($ctx.result.items, []))
      `),
    }));

    api.addQuery('getInvoice', new ResolvableField({
      dataSource,
      returnType: invoiceType.attribute(),
      args: {
        number: GraphqlType.int({ isRequired: true }),
      },
      requestMappingTemplate: MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "operation": "GetItem",
          "key": {
            "pk": $util.dynamodb.toDynamoDBJson($ctx.identity.sub),
            "sk": $util.dynamodb.toDynamoDBJson("INVOICE#" + $args.number)
          }
        }
      `),
      responseMappingTemplate: MappingTemplate.fromString(`
        $util.toJson($ctx.result.item)
      `),
    }));
  }
}
