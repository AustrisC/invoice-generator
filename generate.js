var https = require('https');
var fs = require('fs');

const myData = `
Austris Amazing LLC
Address: Bay Area, San Francisco`;

const recipients = {
  coolCompany: `
  Cool Company, Inc.
  Address: 1234 Freedom Street, NYC`,
};

const generateInvoice = (
  amount,
  currency,
  recipient,
  vatRate = 0,
  date = new Date()
) => {
  // Invoice name, used as number & file name as well
  const invoiceName = getInvoiceNumber(date);

  // Returns reduced amount is VAT is specified
  const invoicedAmount =
    vatRate === 0 ? amount : getVATReducedRate(amount, vatRate);

  // ---------------------------- INVOICE DATA --------------------------------
  const invoiceBaseData = {
    date: dateToString(date),
    from: myData,
    to: recipient,
    currency: currency,
    number: invoiceName,
    items: [
      {
        name: 'Full stack development',
        quantity: 1,
        unit_cost: invoicedAmount,
      },
    ],
  };

  // ---------------------------- VAT DATA --------------------------------
  const vatData =
    vatRate === 0
      ? {}
      : {
          fields: {
            tax: '%',
          },
          tax: vatRate,
          tax_title: 'VAT',
        };

  // ---------------------------- HTTPS REQUEST --------------------------------
  // More info: https://github.com/Invoiced/invoice-generator-api
  const invoiceData = { ...invoiceBaseData, ...vatData };
  const postData = JSON.stringify(invoiceData);
  const options = {
    hostname: 'invoice-generator.com',
    port: 443,
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const file = fs.createWriteStream(`${invoiceName}.pdf`);
  const req = https.request(options, (res) => {
    res.on('data', (chunk) => file.write(chunk)).on('end', () => file.end());
  });

  req.write(postData);
  req.end();
};

const getInvoiceNumber = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return `Austris-LLC-${year}-${month + 1}-${day}`;
};

const dateToString = (date) => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

// Calculates amount to be invoiced with VAT
const getVATReducedRate = (totalSum, vat) => {
  const totalPercentage = 100 + vat;
  const sum = (totalSum * 100) / totalPercentage;

  // Rounds to 2 decimal places
  return Math.round((sum + Number.EPSILON) * 100) / 100;
};

/**
 * AMOUNT (number)
 * Recipient (string)
 * CURRENCY (string)
 * VAT (number) - default 0
 * DATE - date of invoicing (Date) - default today
 *
 * EXAMPLE: generateInvoice(5000, 'eur', recipients.coolCompany, 21, new Date(2021, 0, 1));
 */
generateInvoice(5000, 'usd', recipients.coolCompany, 21);
