import puppeteer, { type Browser, type Page } from 'puppeteer';

export async function generatePdfFromHtml(html: string): Promise<Buffer> {
  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page: Page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export async function generatePdfFromUrl(url: string): Promise<Buffer> {
  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page: Page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
