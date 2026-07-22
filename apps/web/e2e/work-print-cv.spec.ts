import { expect, test } from '@playwright/test';
import { projects } from '../src/app/projects';
import { SUPPORTED_LOCALES, type Locale } from '../src/lib/locale';

const HISTORY_HEADINGS: Record<Locale, string> = {
  en: 'Project history',
  de: 'Projekthistorie',
};

test.describe('work print CV', () => {
  test.skip(
    ({ browserName, isMobile }) => browserName !== 'chromium' || Boolean(isMobile),
    'PDF export requires desktop Chromium',
  );

  for (const locale of SUPPORTED_LOCALES) {
    test(`prints a dedicated A4 CV document (${locale})`, async ({ page, context, baseURL }, testInfo) => {
      await context.addCookies([{ name: 'NEXT_LOCALE', value: locale, url: baseURL ?? 'http://127.0.0.1:3000' }]);
      await page.goto('/work');

      // On screen the print document must stay invisible and the normal view intact.
      const printDocument = page.locator('[data-print-document]');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(printDocument).toBeHidden();

      // Under print media the roles flip: CV visible, site chrome and screen view gone.
      await page.emulateMedia({ media: 'print' });
      await expect(printDocument).toBeVisible();
      // Site chrome (nav header, footer, skip link) sits at body level; the print
      // document nests its own header/footer, so scope to direct body children.
      await expect(page.locator('body > header')).toBeHidden();
      await expect(page.locator('body > footer')).toBeHidden();
      await expect(page.locator('#main-content')).toBeHidden();

      const text = await printDocument.innerText();
      expect(text).toContain('Martin Trenker');
      expect(text).toContain('info@clean.dev');
      expect(text).toContain(HISTORY_HEADINGS[locale]);
      // The complete project history, including entries collapsed on screen.
      for (const project of projects) {
        expect(text).toContain(project.company ?? project.industry?.[locale] ?? project.id);
        expect(text).toContain(project.description[locale]);
      }

      const pdfPath = testInfo.outputPath(`work-cv-${locale}.pdf`);
      const pdf = await page.pdf({ format: 'A4', printBackground: true, path: pdfPath });
      expect(pdf.byteLength).toBeGreaterThan(20_000);
      await testInfo.attach(`work-cv-${locale}.pdf`, { path: pdfPath, contentType: 'application/pdf' });
    });
  }
});
