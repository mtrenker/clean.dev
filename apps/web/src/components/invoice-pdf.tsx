import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { InvoiceWithDetails, Settings } from '@cleandev/pm';

// Formatting helpers
const formatPrice = (number: number | string): string => {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(num);
};

const formatTaxRate = (number: number | string): string => {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
  }).format(num);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
  }).format(date);
};

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 24,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  addressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  addressBlock: {
    flexDirection: 'column',
  },
  addressSmall: {
    fontSize: 8,
    marginBottom: 5,
  },
  addressLine: {
    marginBottom: 2,
  },
  infoSection: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  infoLine: {
    marginBottom: 2,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  mainContent: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
  },
  paragraph: {
    marginBottom: 10,
    lineHeight: 1.4,
  },
  table: {
    marginVertical: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f4',
    padding: 5,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    padding: 5,
  },
  tableCol1: {
    width: '10%',
  },
  tableCol2: {
    width: '40%',
  },
  tableCol3: {
    width: '15%',
    textAlign: 'right',
  },
  tableCol4: {
    width: '15%',
    textAlign: 'right',
  },
  tableCol5: {
    width: '20%',
    textAlign: 'right',
  },
  totalsTable: {
    marginLeft: 'auto',
    width: '66%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 3,
  },
  totalsBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  totalsDoubleBorder: {
    borderBottomWidth: 3,
    borderBottomColor: '#000000',
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headingColumn: {
    flexDirection: 'column',
  },
  qrSection: {
    alignItems: 'center',
  },
  qrCode: {
    width: 80,
    height: 80,
  },
  qrLabel: {
    fontSize: 6,
    color: '#666666',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: 'row',
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flex: 1,
  },
  footerLine: {
    marginBottom: 2,
  },
});

interface InvoicePDFProps {
  invoice: InvoiceWithDetails;
  settings: Settings;
  epcQrCodeUrl?: string;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, settings, epcQrCodeUrl }) => {
  const subtotal = parseFloat(invoice.subtotal);
  const taxRate = parseFloat(invoice.taxRate);
  const taxAmount = parseFloat(invoice.taxAmount);
  const total = parseFloat(invoice.total);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{settings.contractorName}</Text>
          <Text style={styles.headerSubtitle}>Software Beratung</Text>
        </View>

        {/* Address and Info Section */}
        <View style={styles.addressSection}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressSmall}>
              {settings.contractorName}, {settings.contractorAddress}
            </Text>
            <Text style={styles.addressLine}>{invoice.client.name}</Text>
            <Text style={styles.addressLine}>– Rechnungswesen –</Text>
            <Text style={styles.addressLine}>{invoice.client.address}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLine}>
              Rechnungsdatum: {formatDate(invoice.invoiceDate)}
            </Text>
            <Text style={styles.infoLine}>
              Leistungszeitraum: {invoice.periodDescription}
            </Text>
            <Text style={[styles.infoLine, styles.bold]}>
              Rechnungsnummer: {invoice.invoiceNumber}
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.headingRow}>
            <View style={styles.headingColumn}>
              <Text style={styles.heading}>
                Rechnung Nr.: {invoice.invoiceNumber}
              </Text>

              {invoice.client.customFields &&
               typeof invoice.client.customFields === 'object' &&
               'orderNumber' in invoice.client.customFields && (
                <Text style={styles.heading}>
                  Bestellnummer: {String(invoice.client.customFields.orderNumber)}
                </Text>
              )}
            </View>

            {/* EPC QR Code */}
            {epcQrCodeUrl && (
              <View style={styles.qrSection}>
                <Image style={styles.qrCode} src={epcQrCodeUrl} />
                <Text style={styles.qrLabel}>Banking QR Code</Text>
              </View>
            )}
          </View>

          <View style={styles.paragraph}>
            <Text>Sehr geehrte Damen und Herren,</Text>
          </View>

          <View style={styles.paragraph}>
            <Text>
              hiermit erlaube ich mir Ihnen folgende Leistungen in Rechnung zu stellen:
            </Text>
          </View>

          {/* Invoice Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCol1}>Pos.</Text>
              <Text style={styles.tableCol2}>Bezeichnung</Text>
              <Text style={styles.tableCol3}>Stunden</Text>
              <Text style={styles.tableCol4}>Einzelpreis</Text>
              <Text style={styles.tableCol5}>Gesamt</Text>
            </View>

            {invoice.lineItems.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.tableCol1}>{item.position}</Text>
                <Text style={styles.tableCol2}>{item.description}</Text>
                <Text style={styles.tableCol3}>{item.quantity}</Text>
                <Text style={styles.tableCol4}>
                  {formatPrice(parseFloat(item.unitPrice))}
                </Text>
                <Text style={styles.tableCol5}>
                  {formatPrice(parseFloat(item.amount))}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsTable}>
            <View style={styles.totalsRow}>
              <Text>Summe (netto)</Text>
              <Text>{formatPrice(subtotal)}</Text>
            </View>

            <View style={styles.totalsRow}>
              <Text>zzgl. Ust. {formatTaxRate(taxRate)}</Text>
              <Text>{formatPrice(taxAmount)}</Text>
            </View>

            <View style={[styles.totalsRow, styles.totalsBorder]}>
              <Text style={styles.bold}>Gesamt</Text>
              <Text style={styles.bold}>{formatPrice(total)}</Text>
            </View>

            <View style={[styles.totalsRow, styles.totalsDoubleBorder]}>
              <Text style={styles.bold}>Rechnungsbetrag</Text>
              <Text style={styles.bold}>{formatPrice(total)}</Text>
            </View>
          </View>

          <View style={[styles.paragraph, { marginTop: 20 }]}>
            <Text>
              Zahlungsziel: <Text style={styles.bold}>{invoice.client.paymentDueDays || 30} Tage</Text>
            </Text>
            {invoice.client.earlyPaymentDiscountRate && invoice.client.earlyPaymentDueDays && (
              <Text>
                Bei Zahlung bis zum {formatDate(new Date(invoice.invoiceDate.getTime() + invoice.client.earlyPaymentDueDays * 24 * 60 * 60 * 1000))} gewähren wir {formatTaxRate(parseFloat(invoice.client.earlyPaymentDiscountRate))} Skonto.
              </Text>
            )}
            <Text>Ich bitte um Überweisung auf das unten genannte Konto.</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerLine}>{settings.contractorName}</Text>
            <Text style={styles.footerLine}>{settings.contractorAddress}</Text>
          </View>

          <View style={styles.footerRight}>
            <Text style={styles.footerLine}>{settings.bankName}</Text>
            <Text style={styles.footerLine}>IBAN: {settings.bankIban}</Text>
            <Text style={styles.footerLine}>BIC: {settings.bankBic}</Text>
            <Text style={styles.footerLine}>USt-ID: {settings.vatId}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
